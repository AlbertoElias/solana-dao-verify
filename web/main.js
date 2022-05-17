import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import bs58 from 'bs58'

import { SIGNED_MESSAGE } from './src/constants.js'

const verificationInfo = {}

function getErrorMessage (error) {
  console.log(error.message)
  switch (error.message) {
    case 'User rejected the request.':
      return 'You have rejected the signature on Phantom.'
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
    }
  } catch (e) {
    throw e
  }
}

const init = async () => {
  const params = new URLSearchParams(window.location.search)
  verificationInfo.code = params.get('code')

  if (!verificationInfo.code) {
    const discordLogin = document.querySelector('.discord-login')
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
  
      phantomLogin.style.display = 'none'
      await sendVerificationInfo()
    } catch (e) {
      console.log(e)
      showError(e.message)
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