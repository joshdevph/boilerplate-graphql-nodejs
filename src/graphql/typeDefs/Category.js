import { gql } from 'apollo-server-express';

export default gql `
  # -----------------------------------------------
  # MUTATIONS
  # -----------------------------------------------
  extend type Mutation {
    createCategory(description: String): Boolean!
    deleteCategory(description_id: Int!): Boolean!
    updateCategory(description: String! description_id: Int!): Boolean!
  }

  # -----------------------------------------------
  # QUERY
  # -----------------------------------------------
  extend type Query {
    getAllCategory: JSON
  }

  scalar JSON
`