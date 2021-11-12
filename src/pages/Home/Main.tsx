import * as React from 'react';
import { useWeb3React } from '@web3-react/core';
import {
  Container,
  Row,
  Col,
  Card,
  CardText,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody
} from 'reactstrap';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import Swap from 'pages/Swap';
import styled from 'styled-components'

import { Currency, ETHER } from '@deazyyy/elixirswap-sdk';

import HappyCoinIcon from '../../assets/images/happycoin-icon.gif';
import VideoImage from '../../assets/images/video-image.png';
import VideoPlayImage from '../../assets/images/video-play-image.png';
import PlayIcon from '../../assets/images/play-icon.svg';
import DownloadWallet from '../../assets/images/download-icon.png';
import WhiteBitCoin from '../../assets/images/white-bit-icon.png';
import BilaxyCoin from '../../assets/images/bilaxy-icon.png';
import TwitterIcon from '../../assets/images/twitter-icon.svg';
import FacebookIcon from '../../assets/images/facebook-icon.svg';

/* Wallet Icons */

interface TourData {
  steps: Step[],
  localStorageKey: string;
  index: number;
}

interface Step {
  target: string;
  title?: string;
  content: string;
  placement: "left" | "right";
}

const defaultOptions = {
  arrowColor: '#3A395E',
  backgroundColor: '#3A395E',
  beaconSize: 36,
  overlayColor: 'transparent',
  primaryColor: '#3A395E',
  spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
  textColor: '#FFF',
  width: 264,
  zIndex: 50,
}

interface InitialState {
  run: boolean
  modal: boolean
  modalEmbrassing: boolean
  successModal: boolean
  videoModal: boolean
  isTourOpen: boolean
  step: number
  percent: number
  steps: Step[]
  joyrideRef?: Joyride | null,
  currency?: Currency | null,
}

const currentState: InitialState = {
  run: true,
  modal: false,
  modalEmbrassing: false,
  successModal: false,
  videoModal: false,
  isTourOpen: false,
  step: 1,
  percent: 11,
  currency: ETHER,
  steps:  [
    {
      target: '#step_1',
      title: 'Step 1.',
      content: 'Click to connect your wallet ',
      placement: 'right'
    },
    {
      target: '#step_2',
      title: 'Step 2.',
      content: 'Choose which token you’d like to spend.',
      placement: 'left'
    },
    {
      target: '#step_3',
      title: 'Step 3.',
      content: 'Enter the amount you’d like to swap for HappyCoin.',
      placement: 'left'
    },
    {
      target: '#step_4',
      title: 'Final Step',
      content: 'You’re all set, just click this button to confirm your swap!',
      placement: 'left'
    },
    {
      target: '#step_5',
      title: 'Let’s update this',
      content: 'Try setting the slippage to 12%',
      placement: 'right'
    },
    {
      target: '#step_4',
      title: 'Final Step (again)',
      content: 'Let’s try that again, just click this button to confirm your swap!',
      placement: 'left'
    }    
  ],
}

const Main = () => {
  const { account } = useWeb3React()
  const [state, setState] = React.useState(currentState)
  const ref = React.useRef<Joyride | null>()

  React.useEffect(() => {
    if (account && ref.current && ref.current.state.index === 0) {
      console.log()
    }
  }, [account])


  const swapCoin = () => {
    if (currentState.step === 4) {
      setState({...state, 
        successModal: !state.successModal,
      })
    } else {
      setState({...state, 
        modalEmbrassing: !state.modalEmbrassing,
      })      
    }
  }

  const playVideo = () => {
    setState({...state,
      videoModal: !state.videoModal
    })
  }

  const confirmSuccess = () => {
    setState({...state, 
      successModal: !state.successModal,
      step:5
    })
    
  }

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, type, status } = data;

    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setState({ ...state, run: false });
    }

    console.groupCollapsed(type);
    console.log(data);
    console.groupEnd();
  };
  
    return (
      <Container>
        <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
            <Card className="mt-4">
              <CardBody>
                <CardText>
                  <Container>
                    <Row>
                      <Swap/>
                    </Row>
                    <Row className="horizon-divider pt-4 pb-3">
                      <Col>
                        <a href="#help" className="link link-with-divider">Learn how to use</a>
                      </Col>
                      <Col>
                        <a href="https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xB0B924C4a31b7d4581a7F78F57ceE1E65736Be1D" className="link" target="_blank" rel="noopener noreferrer">Buy on an exchange</a>
                      </Col>
                    </Row>
                  </Container>
                </CardText>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-5 help-container">
          <Col>
            <h5 className="text-primary font-weight-bold" id='help'>
              How to use HappySwap
            </h5>
            <div className="video-guide-wrapper">
              <div className="video-preview-image" onClick={() => playVideo()} onKeyDown={() => playVideo()} aria-hidden='true'>
                <img src={VideoImage} alt="" />
                <img src={PlayIcon} className="play-icon" alt="" />
              </div>
              <div className="guide-text">
                <h6 className="guide-title">Video guide</h6>
                <p className="guide-content">Watch the founder of HappyCoin, Sawyer Wildgen run through how to buy $HAPPY.</p>
              </div>
            </div>
            <div className="text-container">
              <h6>Looking for a quick step by step guide instead?</h6>
              <p>We recommend reading this through on desktop, while following along on your phone.</p>
              <ol>
                <li>
                  <p><b>1.</b> On your phone, download the mobile app TrustWallet.</p>
                  <span onClick={() => {window.open('https://trustwallet.com/download-page/')}} onKeyDown={() => {window.open('https://trustwallet.com/download-page/')}} aria-hidden="true" className="cursor-pointer">
                    <img src={DownloadWallet} alt="" className="px-1"/>
                     Download TrustWallet
                  </span>
                </li>
                <li>
                <b>2.</b> Purchase <b>BNB</b> or <b>BSC</b> using TrustWallet.
                </li>
                <li>
                  <p><b>3.</b> In TrustWallet, go to the DApps (or Browser on iOS) tab at the bottom and navigate to <a href="_href">thehappycoin.co/buy</a> through the browser.</p>
                  <small>Note: iPhone users will have to enable the browser within TrustWallet by typing <a href="_href">trust://browser_enable</a> within Safari beforehand.</small>
                </li>
                <li><b>4.</b> Once you&apos;re back on this page through the TrustWallet browser, clcik the <b>Connect wallet</b> button to get started</li>
              </ol>
            </div>
          </Col>
          <Col>
            {/* <h5 className="text-primary font-weight-bold"/> */}
            <div className="exchange-container" id='buy'>
              <p className="text-uppercase font-weight-bold">
                Alternative BUYING METHOD
              </p>
              <h6>Buy $HAPPY on an exchange</h6>
              <p>Over time, HappyCoin will be listed on multiple exchanges to make buying easier. Here&apos;s a list of the exchanges we&apos;re listed on so far. Buying $HAPPY on their platform is based on their pairing with HappyCoin, which is typically USDT. You can buy USDT on their platform directly, then swap it for HappyCoin.</p>
              <div className="trading-links">
                <div className="trading-link">
                  <div className="link-image">
                    <img src={WhiteBitCoin} alt="" className="px-2" />
                    <b className="ml-3 px-2">WhiteBit</b>
                  </div>
                  <a href="_blank" className="buy-link d-flex align-items-center">
                    <span className="mx-2 d-md-block d-none">Buy on WhiteBit</span>
                    <span className="mx-2 d-md-none d-block">Buy</span>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.5 9.75V14.25C13.5 14.6478 13.342 15.0294 13.0607 15.3107C12.7794 15.592 12.3978 15.75 12 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V6C2.25 5.60218 2.40804 5.22064 2.68934 4.93934C2.97064 4.65804 3.35218 4.5 3.75 4.5H8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M11.25 2.25H15.75V6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7.5 10.5L15.75 2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
                <div className="trading-link">
                  <div className="link-image">
                    <img src={BilaxyCoin} alt="" className="px-2"/>
                    <b className="ml-3 px-2">Bilaxy</b>
                  </div>
                  <a href="_blank" className="buy-link d-flex align-items-center">
                    <span className="mx-2 d-md-block d-none">Buy on Bilaxy</span>
                    <span className="mx-2 d-md-none d-block">Buy</span>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.5 9.75V14.25C13.5 14.6478 13.342 15.0294 13.0607 15.3107C12.7794 15.592 12.3978 15.75 12 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V6C2.25 5.60218 2.40804 5.22064 2.68934 4.93934C2.97064 4.65804 3.35218 4.5 3.75 4.5H8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M11.25 2.25H15.75V6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7.5 10.5L15.75 2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
              <p>More exchanges coming soon!</p>
            </div>
          </Col>
        </Row>
        <Modal isOpen={state.videoModal} toggle={playVideo} centered size="lg">
          <ModalBody>
            <img src={VideoPlayImage} alt="" width="100%" />
          </ModalBody>
        </Modal>
      </Container>
    )
}

export default Main
