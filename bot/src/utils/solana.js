import { PublicKey } from '@solana/web3.js'
import { Connection, programs } from '@metaplex/js'
const { metadata: { Metadata } } = programs

async function findNftInCollection (solanaAddress, collectionId, network) {
  const connection = new Connection(network)
  const nfts = await Metadata.findDataByOwner(connection, new PublicKey(solanaAddress))
  if (nfts) {
    const nft = nfts.find(nft => nft.collection
      && nft.collection.verified === 1
      && nft.collection.key === collectionId
    )
    if (nft) {
      return nft
    }
  }
  return null
}

export {
  findNftInCollection
}