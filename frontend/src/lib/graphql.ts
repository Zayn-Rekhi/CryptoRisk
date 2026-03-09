import { gql } from '@apollo/client'

export const CREATE_USER = gql`
  mutation CreateUser($input: User!) {
    createUser(input: $input)
  }
`

export const LOGIN = gql`
  mutation Login($input: User!) {
    login(input: $input)
  }
`

export const LOGIN_GOOGLE = gql`
  mutation LoginGoogle($input: GoogleToken!) {
    loginGoogle(input: $input)
  }
`

export const GET_PROFILES = gql`
  query GetProfiles {
    profiles {
      profileType
      entityRef
      network
      metrics {
        contractAddress
        contractName
        logoURL
        totalBalance
        balanceVolatility
        downsideVolatility
        maxDrawdown
        drawDownVolatility
        giniCoefficientOfBalances
      }
    }
  }
`

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: Profile!) {
    updateUserProfile(input: $input)
  }
`

export const GET_METRICS = gql`
  query GetMetrics($profile: [Profile!]!, $window: Int!) {
    metrics(profile: $profile, window: $window) {
      profileType
      entityRef
      network
      metrics {
        contractAddress
        contractName
        logoURL
        totalBalance
        balanceVolatility
        downsideVolatility
        maxDrawdown
        drawDownVolatility
        giniCoefficientOfBalances
      }
    }
  }
`
