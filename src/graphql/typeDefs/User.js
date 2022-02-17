import { gql } from 'apollo-server-express';

export default gql `
  # -----------------------------------------------
  # TYPES
  # -----------------------------------------------
  type User {
    id: ID
    name: String!
    username: String!
    email: String!
    role: String
  }

  # -----------------------------------------------
  # QUERIES
  # -----------------------------------------------
  extend type Query {
    me: User
    isLoggedIn: Boolean!
    # This Query is for admin user
    users: [User!]
    alladminuser: [User!]
    # This Query is for franchise user
    allFranchiseUserOrFranchiser(id: Int!): [User!]
    franchiseUser(id: Int!): User!
  }

  # -----------------------------------------------
  # MUTATIONS
  # -----------------------------------------------
  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    login(username: String!, password: String!): User!
    logout: User!
    createFranchiser(input: CreateUserInput!): User!
  }

    # -----------------------------------------------
  # SUBSCRIPTION
  # -----------------------------------------------
  extend type Subscription {
    newRegistration: User
  }

  # -----------------------------------------------
  # INPUT
  # -----------------------------------------------
  input CreateUserInput {
    name: String!
    username: String!
    email: String!
    password: String!
    role: String
    userid: Int
  }
`;