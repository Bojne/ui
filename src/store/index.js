// Core
import Vue from 'vue'
import Vuex from 'vuex'

// Plugins
import LogRocket from 'logrocket'
import createPlugin from 'logrocket-vuex'

// Modules
import agent from '@/store/agent'
import api from '@/store/api'
import auth from '@/store/auth'
import data from '@/store/data'
import license from '@/store/license'
import refresh from '@/store/refresh'
import sideNav from '@/store/sideNav'
import tenant from '@/store/tenant'
import user from '@/store/user'
import alert from '@/store/alert'

Vue.use(Vuex)

const logrocketPlugin = createPlugin(LogRocket, mutation => {
  if (
    mutation.type === 'setAuthenticationTokens' ||
    mutation.type === 'setAuthorizationToken' ||
    mutation.type === 'setUser'
  ) {
    return {
      type: mutation.type
    }
  }

  return mutation
})

let authActions

// Checks that we'll be able to install service workers
if (typeof Worker !== 'undefined') {
  authActions = require('@/store/auth/actions.js').default.actions
} else {
  console.log(
    "Shared service worker couldn't be registered, falling back to legacy auth pattern."
  )
  authActions = require('@/store/auth/legacy-actions.js').default.actions
}

const store = new Vuex.Store({
  modules: {
    agent,
    alert,
    api,
    auth: { ...auth, actions: authActions },
    data,
    license,
    refresh,
    sideNav,
    tenant,
    user
  },
  strict: process.env.NODE_ENV !== 'production',
  plugins: [logrocketPlugin]
})

export default store
