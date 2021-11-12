import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  Button
} from 'reactstrap';
import ConnectButton from 'components/ConnectButton';
import { useActiveWeb3React } from 'hooks';
import { useCurrency } from 'hooks/Tokens';
import { DEFAULT_OUTPUT_CURRENCYID } from 'state/swap/hooks';
import { useCurrencyBalance } from 'state/wallet/hooks';
import Logo from '../../assets/images/logo.png';



/**
 * It is important to surround each nav item with Link if you want to use React Router
 */


interface InitialState {
  isOpen: boolean
}

const initialState:InitialState = {
    isOpen: false
}

const NavBar = () => {
    
    const [state, setState] = React.useState(initialState)

    const { account } = useActiveWeb3React()
    const defaultCurrency = useCurrency(DEFAULT_OUTPUT_CURRENCYID)
    const defaultCurrencyBalance = useCurrencyBalance(account?? undefined, defaultCurrency?? undefined)
    console.info('default => ', defaultCurrencyBalance?.toFixed(0))

    const ontoggle = () => {
        setState({...state, 
            isOpen: !state.isOpen
        })
    }

    const shorter = (str) => {
        return str?.length > 8 ? `${str.slice(0, 6)}...${str.slice(-4)}` : str
    }
    return (
      <div>
        <Navbar light expand="md" style={{padding:'12px'}}>
          <Link to="/">
            <NavbarBrand>
              <img src={Logo} alt="Happycoin" width="166px"/>
            </NavbarBrand>
          </Link>
          <NavbarToggler onClick={() => ontoggle()} />
          <Collapse isOpen={state.isOpen} navbar>
            <Nav className="align-items-center" navbar style={{flexGrow: 1}}>
              <Link to="/">
                <NavItem>
                  <NavLink>Home</NavLink>
                </NavItem>
              </Link>
              <Link to="/#">
                <NavItem>
                  <NavLink className="font-weight-bold">Swap</NavLink>
                </NavItem>
              </Link>
              <a href="#help">
                <NavItem>
                  <NavLink>How to buy</NavLink>
                </NavItem>
              </a>
              <a href="#buy">
                <NavItem>
                  <NavLink>Exchanges</NavLink>
                </NavItem>
              </a>
              <NavItem className="live-chart">
                <NavLink href="#">
                  Live chart
                  <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.34367 8.76042V4.15625H4.7395" stroke="#3A395E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.20833 4.29175L3.65625 9.84383" stroke="#3A395E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </NavLink>
              </NavItem>

              {!account? (
                  <ConnectButton className="btn btn-block btn-wallet-connect btn-warning mt-2" />
                ): (
                  <div className="nav-item wallet-info">
                    <div className="wallet-address">{shorter(account)}</div>
                    <div className="wallet-balance">
                      <small className="text-secondary">
                        BALANCE
                      </small>
                      <br/>
                      <p className="text-primary font-weight-bold text-balance">
                        {!defaultCurrencyBalance ? 0 : defaultCurrencyBalance?.toFixed(0)} HAPPY
                      </p>
                  </div>
                </div>            
                )}
            </Nav>
          </Collapse>
          
          
        </Navbar>
      </div>
    );
}

export default NavBar