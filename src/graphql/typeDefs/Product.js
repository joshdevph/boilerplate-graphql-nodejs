import { gql } from 'apollo-server-express';

export default gql `
  # -----------------------------------------------
  # MUTATIONS
  # -----------------------------------------------
  extend type Mutation {
    createProduct(input: CreateProductInput): Product!
    updateProduct(input: CreateProductInput): Boolean!
    deleteProduct(productid: Int!): Boolean
  }

  # -----------------------------------------------
  # QUERIES
  # -----------------------------------------------
  extend type Query {
    getAllPhoto: [Photo]
    getPhoto(img_id: String!): String
    getAllProduct: [Product]
    getProduct(productid: Int!): Product
  }

  # -----------------------------------------------
  # INPUT
  # -----------------------------------------------
  input CreateProductInput {
    product_name: String!
    categoryid: Int!
    imageid: String!
    price: Int!
    productid: Int
  }
  type Product{
    product_name: String!
    categoryid: Int!
    imageid: String!
    price: Int!
    userid: Int
  }

  scalar JSON

  type Product{
    id: Int
    product_name: String
    categoryid: Int
    imageid: String
  }
`;