<script>
import { mapActions, mapGetters } from 'vuex'
import CreateRoleTable from '@/pages/TeamSettings/CreateRoleTable'
import { formatTime } from '@/mixins/formatTimeMixin'
import { ROLE_MAP } from '@/utils/roles.js'

const DEFAULT_ROLES = [
  'TENANT_ADMIN',
  'USER',
  'READ_ONLY_USER',
  'ENTERPRISE_LICENSE_ADMIN'
]

export default {
  components: {
    CreateRoleTable
  },
  mixins: [formatTime],
  data() {
    return {
      deleteSelected: null,
      loading: 0,
      template: null,
      deletingRole: null,
      defaultRoles: DEFAULT_ROLES,
      useDefault: true,
      roleName: '',
      addRole: false,
      roleId: null,
      roleMap: ROLE_MAP,
      defaultRole: null
    }
  },
  computed: {
    ...mapGetters('tenant', ['tenant']),
    ...mapGetters('user', ['user']),
    ...mapGetters('license', [
      'license',
      'hasPermission',
      'allowedUsers',
      'role'
    ]),
    loadingRoles() {
      return Object.values(this.roleMap).filter(
        role => role !== 'Pending' && role !== 'License administrator'
      )
    },
    selectedRole() {
      if (this.roleId) return this.roleId
      if (this.template) return this.template.id
      return null
    },
    editedRoles() {
      if (!this.roles) return []
      const defaultRoles = this.roles?.reduce((arr, role) => {
        if (this.defaultRoles.includes(role.name)) {
          //Check that only license admins are shown license admin role
          if (
            role.id !== '55375f15-fdae-4a2f-b15a-afb6477522cb' ||
            this.role == '55375f15-fdae-4a2f-b15a-afb6477522cb'
          )
            arr.push({ ...role, default: true })
        }
        return arr
      }, [])
      const tenantRoles = this.roles?.filter(
        role => role.tenant_id === this.tenant.id
      )
      return { defaultRoles, tenantRoles }
    }
  },
  watch: {
    editedRoles() {
      if (this.useDefault) {
        const role =
          this.editedRoles?.tenantRoles?.filter(
            role => role.id === this.role
          )[0] ||
          this.editedRoles?.defaultRoles?.filter(
            role => role.id === this.role
          )[0]
        this.defaultRole = role
        this.template = role
      }
    },
    tenant() {
      this.$apollo.queries.roles.refetch()
    },
    license() {
      if (!this.hasPermission('feature', 'custom-role'))
        this.$router.push({ name: 'dashboard' })
    }
  },
  methods: {
    ...mapActions('alert', ['setAlert']),
    formatName(name) {
      return this.roleMap[name]
    },
    handleRoleSelect(role, roleType) {
      this.useDefault = false
      this.roleId = null
      if (roleType === 'new') {
        if (this.addRole) this.cancelAddName(false)
        else this.addRole = true
      } else {
        this.addRole = false
        this.cancelAddName(false)
      }
      this.template = role
    },
    cancelAddName(changeRole = true) {
      this.roleName = ''
      this.addRole = false
      if (changeRole) this.template = this.defaultRole
    },
    async refetch() {
      await this.$apollo.queries.roles.refetch()
      if (this.addRole) this.cancelAddName()
    },
    //Can not delete a role if it's being used in a membership or invitation
    roleInUse(role) {
      return (
        !!this.rolesInUse.filter(
          membershipRole => membershipRole.role_id === role.id
        ).length ||
        !!this.rolesInvited.filter(
          invitationRole => invitationRole.role_id === role.id
        ).length
      )
    },
    async deleteRole(role) {
      this.deletingRole = role.id
      try {
        const res = await this.$apollo.mutate({
          mutation: require('@/graphql/Mutations/delete_custom-role.gql'),
          variables: {
            input: {
              role_id: role.id
            }
          }
        })
        if (res?.data?.delete_custom_role) {
          this.$apollo.queries.roles.refetch()

          this.setAlert({
            alertShow: true,
            alertMessage: 'Role deleted',
            alertType: 'Success'
          })
        }
      } catch (e) {
        this.setAlert({
          alertShow: true,
          alertMessage: `${e}`,
          alertType: 'error'
        })
      } finally {
        this.deletingRole = null
        if (this.template.id === role.id)
          this.template =
            this.editedRoles?.tenantRoles?.filter(
              role => role.id === this.role
            )[0] ||
            this.editedRoles?.defaultRoles?.filter(
              role => role.id === this.role
            )[0]
      }
    }
  },
  apollo: {
    roles: {
      query: require('@/graphql/TeamSettings/roles.gql'),
      loadingKey: 'loading',
      variables() {
        return {}
      },
      pollInterval: 10000,
      update: data => data.auth_role
    },
    rolesInUse: {
      query: require('@/graphql/TeamSettings/membership-roles.gql'),
      loadingKey: 'loading',
      variables() {
        return {}
      },
      pollInterval: 10000,
      update: data => data.membership
    },
    rolesInvited: {
      query: require('@/graphql/TeamSettings/membership-invitation-roles.gql'),
      loadingKey: 'loading',
      variables() {
        return {}
      },
      pollInterval: 10000,
      update: data => data.membership_invitation
    }
  }
}
</script>

<template>
  <v-sheet
    v-if="!hasPermission('read', 'role')"
    height="100vH"
    class="appBackground"
  >
    <div class="text-h4 text-center appBackground pt-8">
      You do not have permission to access roles.
    </div>
  </v-sheet>

  <v-row v-else>
    <v-col cols="3" class="pa-0 ma-0">
      <v-navigation-drawer permanent class="ma-0" height="100%" width="100%">
        <v-list dense nav>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title
                class="text-h5 font-weight-light text--secondary mb-2 pt-4"
              >
                Default Roles
              </v-list-item-title>
              <v-divider></v-divider>
            </v-list-item-content>
          </v-list-item>
          <div v-if="loading">
            <v-list-item
              v-for="(name, index) in loadingRoles"
              :key="index"
              link
            >
              <v-list-item-content>
                <v-list-item-title
                  class="text-body-1 font-weight-regular text--secondary"
                  >{{ name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </div>

          <v-list-item
            v-for="item in editedRoles.defaultRoles"
            v-else
            :key="item.name"
            link
            :style="
              selectedRole === item.id
                ? { 'background-color': 'whiteSmoke' }
                : ''
            "
          >
            <v-list-item-content @click="handleRoleSelect(item, 'default')">
              <v-list-item-title
                :class="selectedRole === item.id ? 'primary--text' : ''"
                class="text-body-1 font-weight-regular text--secondary"
                >{{ formatName(item.name) }}</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-list v-if="hasPermission('feature', 'custom-role')" dense nav>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title
                class="text-h5 font-weight-light text--secondary"
              >
                <span
                  >Custom Roles
                  <v-btn
                    v-if="hasPermission('create', 'role')"
                    :disabled="addRole"
                    color="primary"
                    icon
                    small
                    @click="handleRoleSelect(null, 'new')"
                  >
                    <v-icon v-if="!addRole">add</v-icon>
                  </v-btn></span
                >
              </v-list-item-title>
              <v-divider></v-divider>
            </v-list-item-content>
          </v-list-item>

          <v-sheet
            v-if="!loading"
            :style="{ overflow: 'auto' }"
            :height="$vuetify.breakpoint.xl ? '70vH' : '40vH'"
          >
            <v-list-item v-if="addRole" link>
              <v-list-item-content>
                <v-list-item-title>
                  <v-text-field
                    v-model="roleName"
                    class="text-body-1 font-weight-regular text--secondary pa-0"
                    required
                    autofocus
                    hide-details
                    placeholder="Role Name"
                  ></v-text-field>
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-btn
                  text
                  fab
                  x-small
                  color="blue-grey"
                  @click.stop="cancelAddName"
                >
                  <v-icon>clear</v-icon>
                </v-btn>
              </v-list-item-icon>
            </v-list-item>
            <v-list-item
              v-for="item in editedRoles.tenantRoles"
              :key="item.value"
              class="show-icon"
              link
              :style="
                selectedRole === item.id
                  ? { 'background-color': 'whiteSmoke' }
                  : ''
              "
            >
              <v-list-item-content @click="handleRoleSelect(item, 'tenant')">
                <v-list-item-title
                  :class="selectedRole === item.id ? 'primary--text' : ''"
                  class="text-body-1 font-weight-regular text--secondary"
                  >{{ item.name }}
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-icon class="hidden-icon">
                <div v-if="deleteSelected === item.id">
                  <v-btn
                    :disabled="defaultRoles.includes(item.name)"
                    outlined
                    :loading="deletingRole === item.id"
                    x-small
                    color="error"
                    @click="deleteRole(item)"
                    >Delete
                    <template #loader>
                      <span
                        ><v-progress-circular
                          indeterminate
                          color="error"
                          :width="2"
                          :size="18"
                      /></span>
                    </template>
                  </v-btn>
                  <v-btn icon x-small text @click="deleteSelected = null">
                    <v-icon small>close</v-icon>
                  </v-btn>
                </div>
                <v-tooltip v-else bottom>
                  <template #activator="{ on }">
                    <div v-on="on">
                      <v-btn
                        :disabled="
                          defaultRoles.includes(item.name) || roleInUse(item)
                        "
                        icon
                        x-small
                        class="ml-1"
                        color="error"
                        @click="deleteSelected = item.id"
                        ><v-icon>delete</v-icon></v-btn
                      >
                    </div>
                  </template>
                  <span>{{
                    roleInUse(item) ? 'Role in use' : 'Delete role'
                  }}</span>
                </v-tooltip>
              </v-list-item-icon>
            </v-list-item>
          </v-sheet>
        </v-list>
      </v-navigation-drawer>
    </v-col>
    <v-col cols="9" class="pa-0">
      <CreateRoleTable
        :template="template"
        :role-name="roleName"
        @close="refetch"
      />
    </v-col>
  </v-row>
</template>

<style scoped>
.hidden-icon {
  display: none;
}

.show-icon:hover .hidden-icon {
  display: inline;
}
</style>
