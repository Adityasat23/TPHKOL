export type CatalogItem = {
  name: string;
  image: string;
  category: string;
};

export const DEFAULT_PRODUCT = "/products/default.jpg";

export const TIMEPHORIA_CATALOG: CatalogItem[] = [
  {
    name: "ALTERA BLURRING LIP TINT + LIP MATTE",
    image: "/products/lipmatte2pcs.jpg",
    category: "Combo"
  },

  {
    name: "Altera Blurring Lip Tint",
    image: "/products/blurring-tint.jpg",
    category: "Lips"
  },

  {
    name: "Eternal Lip Matte",
    image: "/products/lip-matte.jpg",
    category: "Lips"
  },

  {
    name: "Illumina Jelly Eyeshadow Stick",
    image: "/products/jelly-eyeshadow-stick.jpg",
    category: "Eyes"
  },

  {
    name: "Lumina Matte Perfection Cushion",
    image: "/products/matte-cushion.jpg",
    category: "Face"
  },

  {
    name: "Lumina Matte Perfection Cushion + Timeless Optima Two Way Cake",
    image: "/products/twc-matte-cushion.jpg",
    category: "Combo"
  },

  {
    name: "Lunara Frost 3D Lip Gloss Lipstick",
    image: "/products/lunara-frost-3d-lip-gloss-lipstick.jpg",
    category: "Lips"
  },

  {
    name: "Milkyway Melting Lip Balm",
    image: "/products/milkyway-melting-lip-balm.jpg",
    category: "Lips"
  },

  {
    name: "Orbita 3-in-1 Blurring Pot Liptint",
    image: "/products/blurring-pot.jpg",
    category: "Lips"
  },

  {
    name: "Orion Cloud Matte Intense Smooth Lipstick",
    image: "/products/orion-cloud-matte-lipstick.jpg",
    category: "Lips"
  },

  {
    name: "Revela Tinted Eyebrow Mascara",
    image: "/products/eyebrow-mascara.jpg",
    category: "Eyes"
  },

  {
    name: "Spectra Ultra Stay Color Transfer Proof Lip Glaze",
    image: "/products/lip-glaze.jpg",
    category: "Lips"
  },

  {
    name: "SUPERNOVA SETTING SPRAY",
    image: "/products/supernova-setting-spray.jpg",
    category: "Face"
  },

  {
    name: "Timephoria Aion Superstain Lip Tattoo Ink",
    image: "/products/timephoria-aion-superstain-lip-tattoo-ink.jpg",
    category: "Lips"
  },

  {
    name: "Stellar Dust Lip Stain",
    image: "/products/lip-stain.jpg",
    category: "Lips"
  },

  {
    name: "Stellar Dust Lip Stain + Eternal Lip Matte",
    image: "/products/stellar-dust-lip-stain-eternal-lip-matte.jpg",
    category: "Combo"
  },

  {
    name: "Timeless Utopia Glow Perfection Cushion",
    image: "/products/glow-cushion.jpg",
    category: "Face"
  },

  {
    name: "ECLIPSE SPARK 2 IN 1 FACE CONTOUR",
    image: "/products/eclipse-spark-2-in-1-face-contour.jpg",
    category: "Face"
  },

  {
    name: "Timeless Valora Fit Perfection Concealer",
    image: "/products/valora-concealer.jpg",
    category: "Face"
  },

  {
    name: "Two Way Cake Timeless Optima Cover",
    image: "/products/two-way-cake.jpg",
    category: "Face"
  },

  {
    name: "TIMELESS FIXION ALL DAY PERFECTION SKIN TINT STICK",
    image: "/products/timeless-fixion-all-day-perfection-skin-tint-stick.jpg",
    category: "Face"
  },

  {
    name: "2PCS Stellar Dust Lip Stain",
    image: "/products/lip-stain-2pcs.jpg",
    category: "Combo"
  }

].sort((a, b) => a.name.localeCompare(b.name));