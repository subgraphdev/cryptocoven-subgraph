
import { Transfer as TransferEvent } from "../generated/CryptoCoven/CryptoCoven";
import { Token, User, TokenMetadata } from "../generated/schema";
import { json, Bytes, dataSource } from "@graphprotocol/graph-ts";
import { TokenMetadata as TokenMetadataTemplate } from "../generated/templates";

const ipfshash = "QmaXzZhcYnsisuue5WRdQDH6FDvqkLQX1NckLqBYeYYEfm";

export function handleTransfer(event: TransferEvent): void {

  let token = Token.load(event.params.tokenId.toString());
  if (!token) {
    token = new Token(event.params.tokenId.toString());
    token.tokenID = event.params.tokenId;
    token.tokenURI = "/" + event.params.tokenId.toString() + ".json";
    const tokenIpfsHash = ipfshash + token.tokenURI;
    token.ipfsURI = tokenIpfsHash;

    TokenMetadataTemplate.create(tokenIpfsHash);

  }

  token.updatedAtTimestamp = event.block.timestamp;
  token.owner = event.params.to.toHexString();
  token.save();


}

export function handleMetadata(content:Bytes):void {
  let tokenMetadata = new TokenMetadata(dataSource.stringParam());
  const value = json.fromBytes(content).toObject();
  if(value){
    const image = value.get('image');
    const name = value.get('name');
    const description = value.get('description');
    const externalURL = value.get('external_url');

    if (image && name && description && externalURL){
      tokenMetadata.name = name.toString();
      tokenMetadata.image = image.toString();
      tokenMetadata.description = description.toString();
      tokenMetadata.externalURL = externalURL.toString();

    }
    const coven = value.get('coven')
    if (coven) {
      let covenData = coven.toObject()
      const type = covenData.get('type')
      if (type) {
        tokenMetadata.type = type.toString()
      }

      const birthChart = covenData.get('birthChart')
      if (birthChart) {
        const birthChartData = birthChart.toObject()
        const sun = birthChartData.get('sun')
        const moon = birthChartData.get('moon')
        const rising = birthChartData.get('rising')
        if (sun && moon && rising) {
          tokenMetadata.sun = sun.toString()
          tokenMetadata.moon = moon.toString()
          tokenMetadata.rising = rising.toString()
        }
      }
    }
  tokenMetadata.save()
  }
}