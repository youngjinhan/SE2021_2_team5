import React from "react";
import { Product } from "shared/Product";
import { DocData } from "../../models/meta";
import Grid from "@material-ui/core/Grid";
import { ProductComments } from "./Comments";

interface Props {
  product: DocData<Product>;
}

export const ProductBottomBar: React.FC<Props> = (props: Props) => {
  const { product } = props;

  return <ProductComments product={product} />;
};
