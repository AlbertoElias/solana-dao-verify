import express from 'express'
import cors from 'cors'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import fetch from 'node-fetch'

import { getUsersModel } from '../models/index.js'
import { SIGNED_MESSAGE } from '../utils/constants.js'

async function getDiscordUserId (code) {
  try {
    const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.WEB_URL}/#verify`,
        scope: 'identify',
      })
    })

    const oauthData = await oauthResult.json()
    if (oauthData.error) {
      throw oauthData.error
    }

    const userResult = await fetch('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${oauthData.token_type} ${oauthData.access_token}`,
      },
    })

    const userResultData = await userResult.json()
    if (userResultData.message) {
      throw userResultData.message
    }
  
    return userResultData.id
  } catch (error) {
    console.error(error)
    return null
  }
}

export function setUpServer (sequelize) {
  const server = express()
  server.use(cors())
  server.use(express.urlencoded({ extended: false }))
  server.use(express.json())

  server.post('/verify', async (req, res) => {
    const { code, solanaAddress, signature } = req.body
    if (!code || !solanaAddress || !signature) {
      return res.status(400).send('Missing required fields.')
    }

    const discordUserId = await getDiscordUserId(code)
    if (!discordUserId) {
      return res.status(400).send('Unsuccessful Discord authorization')
    }

    const Users = getUsersModel(sequelize)
    const verificationId = await Users.findOne({ where: { discordId: discordUserId } })
      || await Users.findOne({ where: { solanaAddress } })
    if (verificationId) {
      return res.status(400).send('Already verified')
    }

    const isSignatureValid = nacl.sign.detached.verify(
      new TextEncoder().encode(SIGNED_MESSAGE),
      bs58.decode(signature),
      bs58.decode(solanaAddress)
    )

    if (isSignatureValid) {
      try {
        await Users.create({
          discordId: discordUserId,
          solanaAddress,
          signature
        })
      } catch (error) {
        console.error(error)
        return res.status(500).send('Error creating verification')
      }

      return res.status(200).send('Verification success.')
    } else {
      return es.status(400).send('Invalid Solana signature.')
    }
  })
  
  server.listen(process.env.PORT, () => console.log(`App listening at http://localhost:${process.env.PORT}`))
}
