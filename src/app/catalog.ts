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
    image: "/products/BLURRING TINT.jpg",
    category: "Lips"
  },

  {
    name: "Eternal Lip Matte",
    image: "/products/LIP MATTE.jpg",
    category: "Lips"
  },

  {
    name: "Illumina Jelly Eyeshadow Stick",
    image: "/products/JELLY EYESHADOW STICK.jpg",
    category: "Eyes" 
  },

  {
    name: "Lumina Matte Perfection Cushion",
    image: "/products/MATTE CUSHION.jpg",
    category: "Face"
  },

  {
    name: "Lumina Matte Perfection Cushion + Timeless Optima Two Way Cake",
    image: "/products/TWC MATTE CUSHION.jpg",
    category: "Combo"
  },

  {
    name: "Lunara Frost 3D Lip Gloss Lipstick",
    image: "/products/Lunara Frost 3D Lip Gloss Lipstick.jpg",
    category: "Lips"
  },

  {
    name: "Milkyway Melting Lip Balm",
    image: "/products/MILKYWAY MELTING LIP BALM.jpg",
    category: "Lips"
  },

  {
    name: "Orbita 3-in-1 Blurring Pot Liptint",
    image: "/products/BLURRING POT.jpg",
    category: "Lips"
  },

  {
    name: "Orion Cloud Matte Intense Smooth Lipstick",
    image: "/products/ORION CLOUD MATTE LIPSTICK.jpg",
    category: "Lips"
  },

  {
    name: "Revela Tinted Eyebrow Mascara",
    image: "/products/EYEBROW MASCARA.jpg",
    category: "Eyes"
  },

  {
    name: "Spectra Ultra Stay Color Transfer Proof Lip Glaze",
    image: "/products/LIP GLAZE.jpg",
    category: "Lips"
  },
  {
    name: "SUPERNOVA SETTING SPRAY",
    image: "/products/SUPERNOVA SETTING SPRAY.jpg",
    category: "Face"
  },
  {
    name: "Timephoria Aion Superstain Lip Tattoo Ink",
    image: "/products/Timephoria Aion Superstain Lip Tattoo Ink.jpg",
    category: "Lips"
  },
  {
    name: "Stellar Dust Lip Stain",
    image: "/products/LIP STAIN.jpg",
    category: "Lips"
  },

  {
    name: "Stellar Dust Lip Stain + Eternal Lip Matte",
    image: "/products/Stellar Dust Lip Stain-Eternal Lip Matte.jpg",
    category: "Combo"
  },

  {
    name: "Timeless Utopia Glow Perfection Cushion",
    image: "/products/GLOW CUSHION.jpg",
    category: "Face"
  },
 {
    name: "ECLIPSE SPARK 2 IN 1 FACE CONTOUR",
    image: "/products/ECLIPSE SPARK 2 IN 1 FACE CONTOUR.jpg",
    category: "Face"
  },
  {
    name: "Timeless Valora Fit Perfection Concealer",
    image: "/products/CONCEALER.jpg",
    category: "Face"
  },

  {
    name: "Two Way Cake Timeless Optima Cover",
    image: "/products/TWO WAY CAKE.jpg",
    category: "Face"
  },
    {
    name: "TIMELESS FIXION ALL DAY PERFECTION SKIN TINT STICK",
    image: "/products/TIMELESS FIXION ALL DAY PERFECTION SKIN TINT STICK.jpg",
    category: "Face"
  },

  {
    name: "2PCS Stellar Dust Lip Stain",
    image: "/products/LIP STAIN 2PCS.jpg",
    category: "Combo"
  }

].sort((a, b) => a.name.localeCompare(b.name));