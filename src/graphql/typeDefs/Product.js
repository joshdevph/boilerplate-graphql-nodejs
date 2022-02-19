import { gql } from 'apollo-server-express';

export default gql `
  # -----------------------------------------------
  # MUTATIONS
  # -----------------------------------------------
  extend type Mutation {
    createProduct(input: CreateProductInput): Product!
  }

  # -----------------------------------------------
  # QUERIES
  # -----------------------------------------------
  extend type Query {
    getAllPhoto: [Photo]
    getPhoto(img_id: String!): String
  }

  # -----------------------------------------------
  # INPUT
  # -----------------------------------------------
  input CreateProductInput {
    product_name: String!
    categoryid: Int!
    imageid: String!
    price: Int!
  }
  type Product{
    product_name: String!
    categoryid: Int!
    imageid: String!
    price: Int!
    userid: Int
  }
`;