import { createGlobalStyle } from 'styled-components'
// eslint-disable-next-line import/no-unresolved
import { PancakeTheme } from '@pancakeswap-libs/uikit'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends PancakeTheme {}
}




const GlobalStyle = createGlobalStyle`
  * {
      font-family: "Google Sans", sans-serif;
  }
  body {
    background-color: #fcfcfc !important;

    img {
      height: auto;
      max-width: 100%;
    }
  }
  .gray{color: #8e8d95 !important}
  .unlockbtn{
    background-color:#b1876d !important;
  }
  .connectbtn{
    position:absolute;
    z-index:100;
    right:20px;
    top:12px;
    button{
      height: 40px;
      border-radius: 12px;
    }
    img{
      height:18px;
    }
  }
  .connectBtn{
    button{
      height: 40px;
    border-radius: 12px ;
    }
    img{
      height:16px;
      margin-right:8px;
      display:none
    }
  }
  .menulinkouter{
    position:relative;
    overflow:hidden
  }
  .btnOuter{
    position:relative;
    overflow:hidden;
    transition:all 0.3s linear;
  }
  .btnOuter:hover{
    transform:scale(1.06);
  }
    .btn_shiny:before{
      content: '';
      display: block;
      position: absolute;
      background: rgba(255, 255, 255, 1);
      width: 60px;
      height: 100%;
      left: 0px;
      top: 0;
      opacity: 0;
      -webkit-filter: blur(30px);
      filter: blur(30px);
      transform: translateX(-50px) skewX(-15deg);         
  }
  .btn_shiny:after{
      content: '';
      display: block;
      position: absolute;
      background: rgba(255, 255, 255, 1);
      width: 30px;
      height: 100%;
      left: 30px;
      top: 0;
      opacity: 0;
      -webkit-filter: blur(5px);
      filter: blur(5px);
      transform: translateX(-50px) skewX(-15deg);          
  }
  .btn_shiny:hover:before {
      transform: translateX(300px) skewX(-15deg);
      opacity: 0.6;
      transition: 2s;
  }
  .btn_shiny:hover:after {
      transform: translateX(300px) skewX(-15deg);
      opacity: 1;
      transition: 2s;
  }
  
  .btn_shiny{
      position: absolute;
      height: 100%;
      width: 100%;
      top: 0;
      left: 0;
      z-index:0
  }

  .homemain{
    margin-top:40px;
    color:#57565c
  }

  .navlogo{
    margin: 30px auto 60px;
    display: block;
    max-width: 130px;
    @media (max-width: 968px) {
      display:none
    }
  }
  
  .styledpanelcss{
    padding-top: 0;
    height: 100%;
    @media (max-width: 968px) {
      padding-top:90px
    }
  }

  .farmbgouter{
    background:url('images/farmbg.png');
    background-size:100%;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    height: 100vh;
    width: 100%;
  }
  .farmupper{
    display:flex;
    justify-content:center;
    align-items:center;
    margin-top:30px;
    margin-bottom:30px;
    h1{margin:0 60px 32px 0};
  }
  .wizardbutton{
    background:#fff;
    color: #57565c;
    border-radius:8px;
    padding:12px 30px !important;
    margin-top:10px;
    height:auto;
    font-size:14px;
    font-weight:500;
    .btn_shiny{
      z-index:-2
    }
    a{
      z-index:100;
      
    }
    &:hover{
      color:#fff
    }
  }
  .wizard{
    position:absolute;
    height:120%;
    right:10%;
    bottom:0;
  }
  .welcheading{
    margin-bottom:20px;
    font-size:32px;
    color:#57565c;
    margin-top:6px
  }

  .farmstaking, .jackpotimg{
    position:absolute;
    width: 100px;
    right: 32px;
    top: -15px;
  }

  .rewardouter{
    display:flex;
    margin-top:50px;
    min-height:176px;
    .rewardrow{
      width:33%;
      border-radius: 15px;
      background-color: #f0f0f0;
      color:#57565c;
      font-weight:600;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:10px;
      font-size:12px;
      margin:0 5px;
      span{
        color:#b4b2b2;
        margin-left:6px
      }
    }
  }
  .panelFooter{
    padding:0px 20px 20px;
    background:#000;
    border-radius:16px;

    margin:50px 26px 0;
    margin-bottom:18px;
    background:#bce8fb;
    img{
      height:100px;
      width:auto;
      margin-top:-50px;
      margin-bottom:8px
    }
  }
  .panelFooter h2{
    color:#57565c;
    margin-bottom:20px;
    line-height:22px;
    font-size:20px;
  }
  .panelFooter button{
      background:#fff;
      color:#57565c !important;
      text-align:center;
      .btn_shiny{display:none}
      a{
        color:#57565c;
        text-decoration:none !important;
        font-size:13px;
      }
  }
  // .panelFooter button:hover{
  //   background:${({ theme }) => theme.colors.invertedContrast} !important;
  // }
  .harvestactionbtn button{font-size:12px}
  .wizardbuttonouter{display:flex}
  .menutopdesk{
    background: transparent;
    border: 0;
    @media (max-width: 968px) {
      background-color: #fff !important;
    }
        
    @media (max-width: 768px) {
      border-bottom: solid 2px rgba(133,133,133,0.1);
    }
  } 
  .menutoplogo{
    opacity:0;
    align-items:center;
    @media (max-width: 968px) {
      opacity:1;
    }
  }
  .exchangeicon{
    svg{
      color:#8e8c95 !important
    }
  }
  .securedinfo{
    display:flex;
    align-items:center;
    color: #8e8d95;
    margin-top:15px;
    font-size:14px;
    text-align:center;  
    justify-content:center;
    img{
      height:20px;
      width:auto;
      margin:0 6px
    }
  }
  .desktop-icon{
    @media (max-width: 500px) {
      width:150px !important;
      height: 60px;

      image{
        width:150px !important;
        height: 55px;
        transform: translateY(-50%);
      }
    }
  }
`

export default GlobalStyle
