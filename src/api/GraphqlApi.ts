import 'src/class/GraphqlClass';
import { api } from 'boot/axios';
import { Discussion, Release } from 'src/class/GraphqlClass';
import { useAuthDataStore } from 'src/stores/AuthData';
import { Mod } from 'src/class/Mod';

const GRAPHQL_URL = 'https://api.github.com/graphql'

function joinQuery(arg: string[]): string {
  return `["${arg.join('\",\"')}"]`
}

export async function getModDetail(mod: Mod): Promise<{ release: Release, discussion: Discussion | undefined }> {
  const authData = useAuthDataStore()
  const queres = [mod.id]
  if (mod.discussion_id) queres.push(mod.discussion_id)
  const queryArg = joinQuery(queres)
  const response = await api.post(GRAPHQL_URL, JSON.stringify({
    query: `{
  nodes(ids: ${queryArg}) {
    ... on Release {
      id
      author {
        login
        avatarUrl
      }
      name
      descriptionHTML
      updatedAt
      releaseAssets(last: 10) {
        nodes {
          id
          name
          createdAt
          updatedAt
          downloadCount
          downloadUrl
        }
      }
      reactionGroups {
        content
        viewerHasReacted
        reactors {
          totalCount
        }
      }
    }
    ... on Discussion {
      id
      comments(first: 10) {
        totalCount
        nodes {
          id
          author {
            login
            avatarUrl
          }
          bodyHTML
          createdAt
          updatedAt
          replies(first: 10) {
            nodes {
              id
              author {
                login
                avatarUrl
              }
              bodyHTML
              createdAt
              updatedAt
              reactionGroups {
                content
                viewerHasReacted
                reactors {
                  totalCount
                }
              }
            }
          }
          reactionGroups {
            content
            viewerHasReacted
            reactors {
              totalCount
            }
          }
        }
      }
    }
  }
}`}), {
    headers: {
      Authorization: authData.token
    }
  })
  const datas = response.data.data.nodes as (Release | (Discussion | undefined))[]
  let release: Release | undefined = undefined
  let discussion: Discussion | undefined = undefined

  datas.forEach((data) => {
    if (data) {
      if ('name' in data) {
        release = data
      } else {
        discussion = data
      }
    }
  })

  if (release) {
    return { release, discussion }
  } else {
    throw Error('getModDetail miss release!')
  }
}
