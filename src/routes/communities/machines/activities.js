import { getClient } from '@urql/svelte';
import { Machine, assign } from 'xstate';

import createPagingConfig from '../../../machines/paging';
import communityQueryApi from '../../../dataSources/api.that.tech/community/queries';

function createServices(client) {
  const {
    queryCommunityActivities,
    queryNextCommunityActivities,
  } = communityQueryApi(client);

  return {
    guards: {
      hasMore: (_, { data }) => data.count > 0,
    },

    services: {
      load: context => queryCommunityActivities({ id: context.meta.id }),

      loadNext: context =>
        queryNextCommunityActivities({
          id: context.meta.id,
          cursor: context.cursor,
        }),
    },

    actions: {
      logError: (context, event) => console.error({ context, event }),

      loadSuccess: assign({
        items: (_, { data }) => data.sessions,
        cursor: (_, { data }) => data.cursor,
      }),

      loadNextSuccess: assign({
        items: (_, { data }) => data.sessions,
        cursor: (_, { data }) => data.cursor,
      }),

      loadedAllSuccess: assign({
        items: () => [],
        cursor: () => undefined,
      }),
    },
  };
}

function create(meta, client = getClient()) {
  const services = createServices(client);
  return Machine({ ...createPagingConfig(meta) }, { ...services });
}

export default create;