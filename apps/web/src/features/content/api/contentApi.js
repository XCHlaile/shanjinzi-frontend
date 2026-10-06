import { validateApiContractMap } from '@shanjinzi/api-contracts'

import { fillPath, pageParams } from '../../../shared/api/requestUtils.js'
import { httpClient } from '../../../shared/api/httpClient.js'

export const contentContracts = validateApiContractMap({
  publicPages: {
    detail: { method: 'GET', path: '/api/public/page-contents/{pageKey}' }
  },
  publicNews: {
    list: { method: 'GET', path: '/api/public/news-articles' },
    detail: { method: 'GET', path: '/api/public/news-articles/{id}' },
    categories: { method: 'GET', path: '/api/public/news-articles/categories' }
  }
}, 'contentContracts')

export function createContentApi(transport = httpClient) {
  const fetchPublicNews = params => (
    transport.get(contentContracts.publicNews.list.path, { query: pageParams(params) })
  )

  return Object.freeze({
    fetchNews: fetchPublicNews,
    fetchPublicPage: pageKey => (
      transport.get(fillPath(contentContracts.publicPages.detail.path, { pageKey }))
    ),
    fetchPublicNews,
    fetchPublicNewsDetail: id => (
      transport.get(fillPath(contentContracts.publicNews.detail.path, { id }))
    ),
    fetchPublicNewsCategories: () => transport.get(contentContracts.publicNews.categories.path)
  })
}

export const contentApi = createContentApi()
