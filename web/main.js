import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import bs58 from 'bs58'

import { SIGNED_MESSAGE } from './src/constants.js'

const verificationInfo = {}

function getErrorMessage (error) {
  console.log(error.message)
  switch (error.message) {
    case 'Failed to fetch':
      return 'Failed to connect to the server.'
    case 'Discord authorization failed.':
      return 'Please allow the bot to check your Discord account to complete the verification.'
    case 'User rejected the request.':
      return 'You have rejected the signature on Phantom.'
    case 'Missing required fields.':
      return 'The verification request was not sent correctly.'
    case 'Unsuccessful Discord authorization':
      return 'We couldn\'t verify your Discord account.'
    case 'Already verified':
      return 'You have already verified your Discord account or your Solana address.'
    case 'Error creating verification':
      return 'There was an error creating the verification request on our server.'
    case 'Invalid Solana signature.':
      return 'The Solana signature made with Phantom is invalid.'
    case 'Unkown error.':
      return 'There was an unknown error.'
    default:
      return error.message
  }
}

function showError (error) {
  const errorMessage = getErrorMessage(error)
  const errorEl = document.querySelector('.error')
  errorEl.innerText = `${errorMessage} Please try again.`
  errorEl.style.display = 'block'
}

function hideError () {
  const errorEl = document.querySelector('.error')
  errorEl.style.display = 'none'
}

async function getSolanaWallet () {
  const adapter = new PhantomWalletAdapter()
  await adapter.connect()
  return adapter
}

async function sendVerificationInfo () {
  try {
    const response = await fetch(`${import.meta.env.VITE_BOT_SERVER}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationInfo)
    })
    if (response.status === 200) {
      return 'Verification success.'
    } else if (response.status === 400 || response.status === 500) {
      const error = await response.text()
      throw error.message
    }
  } catch (e) {
    throw e
  }
}

const init = async () => {
  const params = new URLSearchParams(window.location.search)
  const error = params.get('error')
  verificationInfo.code = params.get('code')

  if (error === 'access_denied') {
    showError(new Error('Discord authorization failed.'))
  }

  if (!verificationInfo.code) {
    const discordLogin = document.querySelector('.discord-login')
    const clientUrl = `${window.location.origin}/#verify`
    discordLogin.href = `https://discord.com/api/oauth2/authorize?client_id=956870483331145808&redirect_uri=${encodeURIComponent(clientUrl)}&response_type=code&scope=identify`
    return discordLogin.classList.remove('disabled')
  }

  const phantomLogin = document.querySelector('.phantom-login')
  phantomLogin.disabled = false

  phantomLogin.addEventListener('click', async (event) => {
    event.preventDefault()
    hideError()

    try {
      const wallet = await getSolanaWallet()
      const encoder = new TextEncoder()
      const signatureUInt8Array = await wallet.signMessage(encoder.encode(SIGNED_MESSAGE))
      const signature = bs58.encode(signatureUInt8Array)
      verificationInfo.solanaAddress = wallet.publicKey
      verificationInfo.signature = signature
  
      phantomLogin.disabled = true
      await sendVerificationInfo()
    } catch (e) {
      showError(e || new Error('Unknown error.'))
      window.history.pushState({}, document.title, `/#verify`)
      phantomLogin.disabled = true
      const discordLogin = document.querySelector('.discord-login')
      return discordLogin.classList.remove('disabled')
    }
  })
}

window.addEventListener('load', init)

function changeSection() {
  const homeLink = document.querySelector('.nav-link--home')
  const verifyLink = document.querySelector('.nav-link--verify')
  if (window.location.hash.includes('verify')) {
    document.querySelector('.verify').style.display = 'block'
    document.querySelector('.home').style.display = 'none'

    homeLink.classList.remove('active')
    verifyLink.classList.add('active')
  } else {
    document.querySelector('.verify').style.display = 'none'
    document.querySelector('.home').style.display = 'block'

    homeLink.classList.add('active')
    verifyLink.classList.remove('active')
  }
  hideError()
}

changeSection()

window.addEventListener('hashchange', changeSection)  