# Solana DAO Verify Bot

**This is a just for fun experiment. It's not stable nor actively maintained. Feel free to open PRs to fix issues or extend the bot though, I'll do my best to reply asap.**

A simple Discord bot that verifies a Discord user has a Solana wallet with a valid NFT to join your Discord server. That NFT needs to be part of a Metaplex collection that you have configured previously.

## Set Up

1. Invite the Bot to your server:
  1.1 Make sure to accept all permissions.
2. So the bot functions correctly, it's Discord role needs to be at the top of the list:
  2.1 Go to your Discord server Settings
  2.2 Click `Roles`
  2.3 Drag the `Solana DAO Verify` role to the top
3. Creeate a Role that will be assigned to verified members.
  3.1 You can have channels that are only visible to people with those roles.
  3.2 Get the ID of the Role by clicking Right => Copy ID. To do this, you need to have Discord in Developer Mode.
4. (Optional) Have a channel for bot messages to people don't flood your other channels.
5. Type `?setup collectionID roleID solana-network`
  5.1 `collectionID` is the Solana address of your Metaplex collection. You can get this from explorer.solana.com.
  5.2 `roleID` is the ID of the Role you created previously for verified members.
  5.3 `solana-network` is optional. By default it will use `devnet`. To use Solana mainnet use `mainnet-beta`.
6. The bot should reply it all went well.
7. Now users can type `?verify`. If they have never verified their account with **Solana DAO Verify Bot** they will receive a DM with a link to do so. In that link they will attach their Discord account to their Solana wallet.
8. Afterwards, they should type `?verify` again which, if they have an NFT of the configured Metaplex collection, they will be assigned the Role you created.
  8.1 If they had already verified their account with the Bot, typing `?verify` once will be enough.
9. Everyday, a script runs to make sure that wallet still holds a valid NFT. If not, the Role is revoked.

## Running locally

1. `npm i`
2. `npm run bootstrap`
3. Check out the server or the web!