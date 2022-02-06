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
    users: [User!]
    isLoggedIn: Boolean!
    alladminuser: [User!]
  }

  # -----------------------------------------------
  # MUTATIONS
  # -----------------------------------------------
  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    login(username: String!, password: String!): User!
    logout: User!
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