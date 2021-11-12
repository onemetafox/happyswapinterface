import { CurrencyAmount, JSBI, Token, Trade } from '@deazyyy/elixirswap-sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ChevronDown } from 'react-feather'
import { CardBody, Button, Text } from '@pancakeswap-libs/uikit'
import styled, { ThemeContext } from 'styled-components'
import { borderRadius, darken } from 'polished'
import AddressInputPanel from 'components/AddressInputPanel'
import Card, { GreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { AutoRow, RowBetween } from 'components/Row'
import AdvancedSwapDetailsDropdown from 'components/swap/AdvancedSwapDetailsDropdown'
import BetterTradeLink from 'components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from 'components/swap/styleds'
import TradePrice from 'components/swap/TradePrice'
import TokenWarningModal from 'components/TokenWarningModal'
import SyrupWarningModal from 'components/SyrupWarningModal'
import ProgressSteps from 'components/ProgressSteps'

import { BETTER_TRADE_LINK_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE } from 'constants/index'
import { isTradeBetter } from 'data/V1'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import { useSwapCallback } from 'hooks/useSwapCallback'
import useToggledVersion, { Version } from 'hooks/useToggledVersion'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { Field, replaceSwapState } from 'state/swap/actions'
import { useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import { useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from 'state/user/hooks'
import { LinkStyledButton, TYPE } from 'components/Shared'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from 'utils/prices'
import Loader from 'components/Loader'
import { TranslateString } from 'utils/translateTextHelpers'
import PageHeader from 'components/PageHeader'
import ConnectWalletButton from 'components/ConnectWalletButton'

import {
  Row,
  Col,
  CardTitle,
  CardSubtitle,
  Modal,
  ModalHeader,
  ModalBody  
} from 'reactstrap';
import CurrencyLogo from 'components/CurrencyLogo'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'

import StepTooltip from "components/StepTooltip";
import AppBody from '../AppBody'
import HappyCoinIcon from '../../assets/images/happycoin-icon.gif';
import ArrowRight from '../../assets/images/arrow-right.svg';
import TwitterIcon from '../../assets/images/twitter-icon.svg';
import FacebookIcon from '../../assets/images/facebook-icon.svg';


const CurrencySelect = styled.button<{ selected: boolean }>`
  color: #3A395E;
  font-weight: bold;
  border: 0;
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const { main: Main } = TYPE

const Swap = () => {
  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff included 
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId), 
  ] 

  const [slipWarningStatus, setSlipWarningStatus] = useState<boolean>(false)
  
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const [isSyrup, setIsSyrup] = useState<boolean>(false)
  const [stepIndex, setStepIndex] = useState<number>(1)
  const [syrupTransactionType, setSyrupTransactionType] = useState<string>('')
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  const handleConfirmSyrupWarning = useCallback(() => {
    setIsSyrup(false)
    setSyrupTransactionType('')
  }, [])

  const { account } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  //   const { address: recipientAddress } = useENSAddress(recipient)
  const toggledVersion = useToggledVersion()
  const trade = showWrap
    ? undefined
    : {
        [Version.v1]: v1Trade,
        [Version.v2]: v2Trade,
      }[toggledVersion]

  const betterTradeLinkVersion: Version | undefined =
    toggledVersion === Version.v2 && isTradeBetter(v2Trade, v1Trade, BETTER_TRADE_LINK_THRESHOLD)
      ? Version.v1
      : toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade)
      ? Version.v2
      : undefined

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {      
      setStepIndex(4);
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  useEffect(() => {
    console.log("account - ",account)
    if (! account) {
      setStepIndex(1)
    } else {
      setStepIndex(2)
    }
  }, [account])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  )

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState((prevState) => ({ ...prevState, attemptingTxn: true, swapErrorMessage: undefined, txHash: undefined }))
    swapCallback()
      .then((hash) => {
        setSwapState((prevState) => ({
          ...prevState,
          attemptingTxn: false,
          swapErrorMessage: undefined,
          txHash: hash,
        }))
      })
      .catch((error) => {
        setSwapState((prevState) => ({
          ...prevState,
          attemptingTxn: false,
          swapErrorMessage: error.message,
          txHash: undefined,
        }))
      })
  }, [priceImpactWithoutFee, swapCallback, setSwapState])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState((prevState) => ({ ...prevState, showConfirm: false, txHash: undefined }))

    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [onUserInput, txHash, setSwapState])

  const handleAcceptChanges = useCallback(() => {
    setSwapState((prevState) => ({ ...prevState, tradeToConfirm: trade }))
  }, [trade])

  // This will check to see if the user has selected Syrup to either buy or sell.
  // If so, they will be alerted with a warning message.
  const checkForSyrup = useCallback(
    (selected: string, purchaseType: string) => {
      if (selected === 'syrup') {
        setIsSyrup(true)
        setSyrupTransactionType(purchaseType)
      }
    },
    [setIsSyrup, setSyrupTransactionType]
  )

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setStepIndex(3);
      console.log('input currency', inputCurrency)
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
      if (inputCurrency.symbol.toLowerCase() === 'syrup') {
        checkForSyrup(inputCurrency.symbol.toLowerCase(), 'Selling')
      }
    },
    [onCurrencySelection, setApprovalSubmitted, checkForSyrup]
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact())
    }
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
      if (outputCurrency.symbol.toLowerCase() === 'syrup') {
        checkForSyrup(outputCurrency.symbol.toLowerCase(), 'Buying')
      }
    },
    [onCurrencySelection, checkForSyrup]
  )

  // Currency search modal
  const [modalOpen, setModalOpen] = useState(false)
  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <>
      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      <AppBody >
        <Wrapper id="swap-page ">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />
          <CardTitle tag="h5" className="text-primary pt-3">HappySwap</CardTitle>
          <CardSubtitle tag="p" className="text-primary my-2">Trade your tokens $HAPPY in an instant</CardSubtitle> 
          <Aligner className="position-relative">
            {
              account && stepIndex === 2 &&
                <StepTooltip placement="left" style={{top: '-25px'}}>
                  <button type="button" className="step-tooltip-close-button" onClick={() => setStepIndex(0)}>
                    <svg viewBox="0 0 24 24" fill="white" width="20px" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z" />
                    </svg>
                  </button>
                  <h3>Step2.</h3>
                  <p className="mb-2">Choose which token you’d like to spend.</p>
                </StepTooltip>
            }
            <CurrencySelect
              selected={!!currencies[Field.INPUT]}
              className="currency-select-button from-button px-3"
              onClick={() => setModalOpen(true)}
              id="step_2"
            >
              <Aligner>
                {currencies[Field.INPUT] && (
                  <>
                    <span className='d-flex'>
                      <span className='coin-image'><CurrencyLogo currency={currencies[Field.INPUT]} style={{ margin: '12px' }} /></span>
                      <span className='d-flex' style={{ alignItems: 'center', marginLeft: '10px' }}>
                        {currencies[Field.INPUT] && currencies[Field.INPUT]?.symbol && (currencies[Field.INPUT]?.symbol?.length || 0) > 20
                          ? (`${currencies[Field.INPUT]?.symbol?.slice(0, 4) 
                            }...${ 
                              currencies[Field.INPUT]?.symbol?.slice((currencies[Field.INPUT]?.symbol?.length|| 0) - 5, currencies[Field.INPUT]?.symbol?.length)}`)
                          : (currencies[Field.INPUT]?.symbol || 'Select a currency')}
                      </span>
                    </span>
                  </>)}
                <ChevronDown />
              </Aligner>
            </CurrencySelect>
            <img src={ArrowRight} className="swap-icon" alt="" />
            <Button className="currency-select-button to-button px-3">
              <span className="coin-image">
                <img className="happy-coin" src={HappyCoinIcon} alt="" />
              </span>
              <span className="d-inline-block">HappyCoin</span>
            </Button>
          </Aligner>                   
          <CardBody style={{paddingLeft:'0px', paddingRight:'0px', paddingBottom:'30px', paddingTop:'10px'}}>
            <AutoColumn gap="md" className="position-relative">
              {
                stepIndex === 3 &&
                  <StepTooltip placement="left" style={{top: '10px'}}>
                    <button type="button" className="step-tooltip-close-button" onClick={() => setStepIndex(0)}>
                      <svg viewBox="0 0 24 24" fill="white" width="20px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z" />
                      </svg>
                    </button>
                    <h3>Step3.</h3>
                    <p>Enter how much BNB you’d like to swap for HappyCoin.</p>
                  </StepTooltip>
              }
              <CurrencyInputPanel
                label='Amount in'
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={!atMaxAmountInput}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                otherCurrency={currencies[Field.OUTPUT]}
                id="step_3"
              />
              <CurrencyInputPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                label='Amount out'
                showMaxButton={false}
                currency={currencies[Field.OUTPUT]}
                otherCurrency={currencies[Field.INPUT]}
                id="swap-currency-output"
              />

              <PageHeader title=" "/>

              {recipient !== null && !showWrap ? (
                <>
                  <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                    <ArrowWrapper clickable={false}>
                      <ArrowDown size="16" color={theme.colors.textSubtle} />
                    </ArrowWrapper>
                    <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                      - Remove send
                    </LinkStyledButton>
                  </AutoRow>
                  <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                </>
              ) : null}

              {showWrap ? null : (
                <Card padding=".25rem .75rem 0 .75rem" borderRadius="20px">
                  <AutoColumn gap="4px">
                    {Boolean(trade) && (
                      <RowBetween align="center">
                        <Text fontSize="14px">Price</Text>
                        <TradePrice
                          price={trade?.executionPrice}
                          showInverted={showInverted}
                          setShowInverted={setShowInverted}
                        />
                      </RowBetween>
                    )}
                    {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                      <RowBetween align="center" className="position-relative">
                        <Text fontSize="14px">Slippage Tolerance</Text>
                        <Text fontSize="14px">{allowedSlippage / 100}%</Text>
                        {
                          stepIndex === 5 &&
                            <StepTooltip placement="right" style={{ top: '-40px' }}>
                              <button type="button" className="step-tooltip-close-button" onClick={() => setStepIndex(0)}>
                                <svg viewBox="0 0 24 24" fill="white" width="20px" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z" />
                                </svg>
                              </button>
                              <h3>Let’s update this</h3>
                              <p>Try setting the slippage to 12%</p>
                            </StepTooltip>
                        }
                      </RowBetween>
                    )}
                  </AutoColumn>
                </Card>
              )}
            </AutoColumn>
            <BottomGrouping className="position-relative">
              {
                ( stepIndex === 4 || stepIndex === 6 ) &&
                  <StepTooltip placement="left" style={{ top: '-30px' }}>
                    <button type="button" className="step-tooltip-close-button" onClick={() => setStepIndex(0)}>
                      <svg viewBox="0 0 24 24" fill="white" width="20px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z" />
                      </svg>
                    </button>
                    <h3>Final Step{stepIndex === 6 && ' (again)'}</h3>
                    <p>You’re all set, just click this button to confirm your swap!</p>
                  </StepTooltip>
              }              
              {
                stepIndex === 1 && !account &&
                  <StepTooltip placement="right" style={{ top: '-30px' }}>
                    <button type="button" className="step-tooltip-close-button" onClick={() => setStepIndex(0)}>
                      <svg viewBox="0 0 24 24" fill="white" width="20px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.3 5.70997C17.91 5.31997 17.28 5.31997 16.89 5.70997L12 10.59L7.10997 5.69997C6.71997 5.30997 6.08997 5.30997 5.69997 5.69997C5.30997 6.08997 5.30997 6.71997 5.69997 7.10997L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.10997C18.68 6.72997 18.68 6.08997 18.3 5.70997Z" />
                      </svg>
                    </button>
                    <h3>Step1.</h3>
                    <p>Click to connect your wallet</p>
                  </StepTooltip>
              }
              {!account ? (
                <ConnectWalletButton fullWidth className='connect-btn'/>
              ) : showWrap ? (
                <Button className="connect-btn" disabled={Boolean(wrapInputError)} onClick={onWrap} fullWidth>
                  {wrapInputError ??
                    (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                </Button>
              ) : noRoute && userHasSpecifiedInputOutput ? (
                <GreyCard style={{ textAlign: 'center' }}>
                  <Main mb="4px">Insufficient liquidity for this trade.</Main>
                </GreyCard>
              ) : showApproveFlow ? (
                <RowBetween>
                  <Button
                    className="connect-btn"
                    onClick={approveCallback}
                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                    style={{ width: '48%' }}
                    variant={approval === ApprovalState.APPROVED ? 'success' : 'primary'}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <AutoRow gap="6px" justify="center">
                        Approving <Loader stroke="white" />
                      </AutoRow>
                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                      'Approved'
                    ) : (
                      `Approve ${currencies[Field.INPUT]?.symbol}`
                    )}
                  </Button>
                  <Button
                    className="connect-btn"
                    onClick={() => {
                      console.info('slippage, ', allowedSlippage)
                      if (allowedSlippage < 1200) {
                        setSlipWarningStatus(true)
                      } else if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        })
                      }
                    }}
                    style={{ width: '48%' }}
                    id="step_4"
                    disabled={
                      !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                    }
                    variant={isValid && priceImpactSeverity > 2 ? 'danger' : 'primary'}
                  >
                    {priceImpactSeverity > 3 && !isExpertMode
                      ? `Price Impact High`
                      : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                  </Button>
                </RowBetween>
              ) : (
                <Button
                  className="connect-btn"
                  onClick={() => {
                    console.info('slippage, ', allowedSlippage)
                    if (allowedSlippage < 1200) {
                      setSlipWarningStatus(true)
                    } else if (isExpertMode) {
                      handleSwap()
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined,
                      })
                    }
                  }}
                  id="step_4"
                  disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                  variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'danger' : 'primary'}
                  fullWidth
                >
                  {swapInputError ||
                    (priceImpactSeverity > 3 && !isExpertMode
                      ? `Price Impact Too High`
                      : `Swap ${ currencies[Field.INPUT]?.symbol } for HappyCoin`)}
                </Button>
              )}
              {showApproveFlow && <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />}
              {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
              {betterTradeLinkVersion && <BetterTradeLink version={betterTradeLinkVersion} />}
            </BottomGrouping>
          </CardBody>
        </Wrapper>
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={handleInputSelect}
          selectedCurrency={currencies[Field.INPUT]}
          otherSelectedCurrency={currencies[Field.OUTPUT]}
          showCommonBases={false}
        />
        <Modal isOpen={slipWarningStatus} className="modal-swap-info" toggle={() => {setSlipWarningStatus(false)}} centered>
          <ModalBody className="p-5">
            <h3 className="text-primary text-center mb-3">Oh dear, this is embrassing</h3>
            <p className="text-primary text-center">It looks like the <b>Slippage Tolerance</b> wasn’t high enough to perform this swap. We apologize about this.</p>
            <p className="text primary text-center">Try setting the Slippage Tolerance to 1% higher than what it was. Usually swaps work between 11%-15%.</p>
            <Button
              id="step_1"
              className="slippage-btn mt-2 w-100"
              onClick={() => {setSlipWarningStatus(false)}}
            >Update Slippage Tolerance</Button>
          </ModalBody>
        </Modal> 
        <Modal isOpen={txHash} toggle={handleConfirmDismiss} className="modal-swap-info" centered>
          <ModalBody className="p-5 text-center">
            <img src={HappyCoinIcon} alt="" width={120} height={120} />
            <h3 className="text-primary text-center mb-3 font-weight-bold">Success, you’ve just got yourself {formattedAmounts[Field.OUTPUT]} HAPPYCOIN!</h3>
            <p className="text-primary text-center">Here&apos;s your HappySwap secret code you can use to gain more entries into our daily giveaway:</p>
            <p className="text primary text-center my-3">
              <span className="happycoin-token d-inline-block font-weight-bold" style={{marginLeft:"5px"}}>
                $HAPPYSWAP2021
                <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg" cursor="pointer" onClick={() => {
                  navigator.clipboard.writeText("$HAPPYSWAP2021")
                }}>
                  <path d="M6.45866 13.9792C5.5727 13.9792 4.85449 13.261 4.85449 12.3751V6.18758C4.85449 5.17506 5.6753 4.35425 6.68783 4.35425H12.8753C13.7613 4.35425 14.4795 5.07246 14.4795 5.95841" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16.3122 8.02075H10.3538C9.34132 8.02075 8.52051 8.84156 8.52051 9.85409V15.8124C8.52051 16.8249 9.34132 17.6458 10.3538 17.6458H16.3122C17.3247 17.6458 18.1455 16.8249 18.1455 15.8124V9.85409C18.1455 8.84156 17.3247 8.02075 16.3122 8.02075Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </p>
            <div className="d-flex align-items-center justify-content-center">
              <Button className="social-btn">
                <img src={TwitterIcon} alt="" />
                <span className="font-weight-bold ml-10">Tweet</span>
              </Button>
              <Button className="social-btn">
                <img src={FacebookIcon} alt="" />
                <span className="font-weight-bold ml-10">Share</span>
              </Button>
            </div>
          </ModalBody>
        </Modal>               
      </AppBody>
      {
        trade &&
        <AdvancedSwapDetailsDropdown trade={trade} />
      }
    </>
  )
}

export default Swap
