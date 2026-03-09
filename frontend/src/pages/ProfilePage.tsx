import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { DashboardShell } from '../components/DashboardShell'
import { Button, Card, Input, Label } from '../components/ui'
import { GET_PROFILES, UPDATE_USER_PROFILE } from '../lib/graphql'

function ProfilePage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [profileType, setProfileType] = useState('wallet')
  const [entityRef, setEntityRef] = useState('')
  const [network, setNetwork] = useState('eth-mainnet')

  const { data, loading, error, refetch } = useQuery(GET_PROFILES)
  const [updateProfile] = useMutation(UPDATE_USER_PROFILE)

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({
        variables: {
          input: {
            profileType,
            entityRef,
            network,
            action: 'add',
          },
        },
      })
      setShowAddForm(false)
      setEntityRef('')
      refetch()
    } catch (err: any) {
      alert('Failed to add profile: ' + err.message)
    }
  }

  const handleRemoveProfile = async (profile: any) => {
    if (!window.confirm('Remove this profile?')) return
    try {
      await updateProfile({
        variables: {
          input: {
            profileType: profile.profileType,
            entityRef: profile.entityRef,
            network: profile.network,
            action: 'remove',
          },
        },
      })
      refetch()
    } catch (err: any) {
      alert('Failed to remove profile: ' + err.message)
    }
  }

  return (
    <DashboardShell
      title="Dashboard"
      subtitle="Add and manage wallet profiles used for metrics calculations."
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-sm text-gray-600">
          Profiles power your calculations. Add one to get started.
        </div>
        <Button onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? 'Close' : 'Add profile'}
        </Button>
      </div>

      {showAddForm ? (
        <Card className="p-5 mb-6">
          <form onSubmit={handleAddProfile}>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="profileType">Profile type</Label>
                <select
                  id="profileType"
                  value={profileType}
                  onChange={(e) => setProfileType(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 outline-none"
                >
                  <option value="wallet">Wallet</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div>
                <Label htmlFor="network">Network</Label>
                <select
                  id="network"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 outline-none"
                >
                  <option value="eth-mainnet">Ethereum Mainnet</option>
                  <option value="polygon-mainnet">Polygon Mainnet</option>
                  <option value="bsc-mainnet">BSC Mainnet</option>
                  <option value="avalanche-mainnet">Avalanche Mainnet</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <Label htmlFor="entityRef">Entity reference</Label>
                <div className="mt-2">
                  <Input
                    id="entityRef"
                    value={entityRef}
                    onChange={(e) => setEntityRef(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-gray-900">Profiles</div>
          <div className="text-xs text-gray-500">{data?.profiles?.length ?? 0} total</div>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-sm text-gray-600">Loading…</div>
        ) : error ? (
          <div className="px-5 py-10 text-sm text-red-700">Error: {error.message}</div>
        ) : !data?.profiles || data.profiles.length === 0 ? (
          <div className="px-5 py-10 text-sm text-gray-600">
            No profiles yet. Click “Add profile” to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Type</th>
                  <th className="text-left font-semibold px-5 py-3">Network</th>
                  <th className="text-left font-semibold px-5 py-3">Address</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.profiles.map((profile: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-gray-900 capitalize">
                      {profile.profileType}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{profile.network}</td>
                    <td className="px-5 py-3 text-gray-700 font-mono break-all">
                      {profile.entityRef}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveProfile(profile)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  )
}

export default ProfilePage
