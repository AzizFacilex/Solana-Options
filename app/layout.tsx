import { WalletContextProvider } from '../components/WalletContextProvider'
import '../styles/globals.css'

export const metadata = {
  title: 'Solana Minute Options',
  description: 'A decentralized options trading platform on Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Solana Minute Options</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gray-900">
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  )
} 