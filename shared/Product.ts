import { Entity } from "./Entity";
import { Author } from "./UserData";

export type SellTypes = "bid" | "fixed";
export type productStatus = "Process" | "Available" |"Sold";
export interface Product extends Entity {
  title: string;
  location: string;
  sellType: SellTypes; //판매 방법
  price: number; // 가격
  images: string[];
  desc: string;
  phonenumber: string;
  
  sellerUid: string;
  sellerName: string;
  buyerUid: string;
  buyerName: string;
  boughtAt: any;
  createdAt: any;
  wishlists: string[];
  status: productStatus;
}
/**
 * 입찰. `Product`의 하위 엔티티.
 */
export interface Bid {
  uid: string;
  createdAt: Date;
  price: number;
}

export interface ProductComment {
  writer: Author;

  /**
   * 올린 시간
   */
  createdAt: Date;

  content: string;
}
