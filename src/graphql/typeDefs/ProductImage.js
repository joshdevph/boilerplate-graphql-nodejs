import { gql } from 'apollo-server-express';

export default gql `
  # -----------------------------------------------
  # MUTATIONS
  # -----------------------------------------------
  extend type Mutation {
    uploadPhoto(photo: String!): String!
  }

  # -----------------------------------------------
  # QUERIES
  # -----------------------------------------------
  extend type Query {
    getAllPhoto: [Photo]
    getPhoto(img_id: String!): String
  }

  type Photo{
      url: String
      asset_id: String
  }
`;