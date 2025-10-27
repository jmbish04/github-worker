/**
 * GraphQL API proxy.
 */
import { graphql } from '@octokit/graphql'

export async function queryGraphQL(token: string, query: string, variables: any = {}) {
  const client = graphql.defaults({ headers: { authorization: `Bearer ${token}` } })
  return await client(query, variables)
}
