import { MenuEntry } from '@pancakeswap-libs/uikit'

const config: MenuEntry[] = [
  {
    label: 'Home',
    icon: 'HomeIcon',
    href: 'https://www.elixir-swap.io/'
  },
  {
    label: 'Trade',
    icon: 'TradeIcon',
    initialOpenState: true,
    items: [
      {
        label: 'Exchange',
        href: '/swap'
      },
      {
        label: 'Liquidity',
        href: '/pool'
      }
    ]
  },
  {
    label: 'Elixir Mix',
    icon: 'FarmIcon',
    href: 'https://www.elixir-swap.io/farms'
  },
  {
    label: 'Potion Brew',
    icon: 'PoolIcon',
    href: 'https://www.elixir-swap.io/nests'
  },
  {
    label: 'More',
    icon: 'MoreIcon',
    items: [
      {
        label: 'Github',
        href: 'https://github.com/elixirswap/elixirswap.io',
      },
      {
        label: 'Gitbook',
        href: 'https://app.gitbook.com/@tagamisan/spaces',
      },
    ],
  },
]

export default config
