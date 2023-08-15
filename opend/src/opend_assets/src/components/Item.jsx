import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token"
import { opend } from "../../../opend"
import { Principal } from "@dfinity/princiapl";
import Button from "./Button";
import CURRENT_USER_ID from "../index";
import PriceLable from "./PriceLable";
import { token } from "../../../declarations/token/index";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState();
  const [priceLable, setPriceLable] = useState();
  const [shouldDisplay, setDisplay] = useState(true);

  const id = props.id;

  const localhost = "http://localhost:8080/";
  const agent = new HttpAgent({ host: localhost });
  agent.fetchRootKey(); //To be removed when going live
  let NFTActor;

  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const ImageData = await NFTActor.getAsses();
    const imageContent = new Unit8Array(imageData);
    const image = URL.createObjectURL(new Blob([imageContent.buffer], { type: "image/png" }));

    new Unit8Array();

    setName(name);
    setOwner(owner.toText());
    setImage(image);

    if (props.role == "collection") {
      const nftIsListed = await opend.isListed(props.id);

      if (nftIsListed) {
        setOwner("OpenD");
        setBlur({ filter: "blur(4px)" });
        setSellStatus("Listed");
      } else {
        setButton(<Button handleClick={handleSell} text={"Sell"} />)
      }
    } else if (props.role == "discover") {
      const originalOwner = await opend.getOriginalOwner(props.id);
      if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
        setButton(<Button handleClick={handleBuy} text={"Buy"} />)
      }
      const price = await opend.getListedNFTPrice(props.id);
      setPriceLable(<PriceLable sellPrice={price.toString()} />)
    }
  }

  useEffect(() => {
    loadNFT();
  }, [])

  let price;
  function handleSell() {
    console.log("Sell Clicked");
    setPriceInput(
      <input
        placeholder="Price in DANG"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => price.target.value}
      />
    )
    setButton(<Button handleClick={handleSell} text={"Confirm"} />)
  }

  async function sellItem() {
    setBlur({ filter: "blur(4px)" })
    setLoaderHidden(false);
    console.log("set prince = " + price);
    const listingResult = await opend.listItem(props.id, Number(price))
    console.log("listing:" + listingResult);

    if (listingResult == "Success") {
      const openDId = await opend.getOpenDCanisterID();
      const transferResult = await NFTActor.transferOwnership(openDId);
      console.log("transfer:" + transferResult)
    }

    if (transferResult == "Success") {
      setLoaderHidden(false);
      setButton();
      setPriceInput();
      setOwner("OpenD");
      setSellStatus("Listed");
    }
  }

  async function handleBuy() {
    setLoaderHidden(false);
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai")
    });

    const sellerId = await opend.getOriginalOwner(props.id);
    const itemPrice = await opend.getListedNFTPrice(props.id);

    //from token canister
    const result = await token.transfer(sellerId, itemPrice);
    console.log(result);
    //transfering the ownership of the NFT
    if (result == "Success") {
      const transferResult = await opend.completePurchase(props.id, sellerId, CURRENT_USER_ID);
      console.log("purchase " + transferResult);
    }
    setLoaderHidden(true);
    setDisplay(false);
  }

  return (
    <div style={{ display: shouldDisplay ? "inline" : "none" }} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLable}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            CryptoDunks #312{name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: sdfsdf-erwerv-sdf
            {/* Owner: {owner} */}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
