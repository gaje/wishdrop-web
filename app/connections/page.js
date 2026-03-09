'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'


export default function ConnectionsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('connections')
  const [connections, setConnections] = useState([])
  const [pending, setPending] = useState([])
  const [sent, setSent] = useState([])
  const [blocked, setBlocked] = useState([])
  const [inviteCode, setInviteCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, activeTab])

  const checkAuth = async () => {
    try {
      const data = await api.auth.me()
      setUser(data.user)
    } catch (err) {
      router.push('/login')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'connections') {
        const data = await api.connections.getAll()
        setConnections(data.connections || [])
      } else if (activeTab === 'pending') {
        const [incomingData, sentData] = await Promise.all([
          api.connections.getPending(),
          api.connections.getSentPending(),
        ])
        setPending(incomingData.requests || [])
        setSent(sentData.requests || [])
      } else if (activeTab === 'blocked') {
        const data = await api.blocks.getAll()
        setBlocked(data.blocks || [])
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveConnection = async (userId) => {
    if (!confirm('Remove this connection?')) return

    try {
      await api.connections.remove(userId)
      setConnections(connections.filter((c) => c.user._id !== userId))
    } catch (err) {
      alert(err.getUserMessage?.() || 'Failed to remove connection')
    }
  }

  const handleAcceptRequest = async (connectionId) => {
    try {
      await api.connections.acceptRequest(connectionId)
      fetchData()
    } catch (err) {
      alert(err.getUserMessage?.() || 'Failed to accept request')
    }
  }

  const handleDeclineRequest = async (connectionId) => {
    try {
      await api.connections.rejectRequest(connectionId)
      fetchData()
    } catch (err) {
      alert(err.getUserMessage?.() || 'Failed to decline request')
    }
  }

  const handleUnblock = async (userId) => {
    try {
      await api.blocks.unblock(userId)
      setBlocked(blocked.filter((b) => b.blockedUser._id !== userId))
    } catch (err) {
      alert(err.getUserMessage?.() || 'Failed to unblock user')
    }
  }

  const handleGenerateInvite = async () => {
    try {
      const data = await api.connections.createInvite()
      setInviteCode(data.code)
    } catch (err) {
      alert(err.getUserMessage?.() || 'Failed to generate invite link')
    }
  }

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/connections/invite/${inviteCode}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50" />
  }

  const pendingCount = pending.length + sent.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Connections
          </h1>
          <p className="text-gray-600">
            Manage your connections, requests, and blocked users.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('connections')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'connections'
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Connections
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition relative ${
                  activeTab === 'pending'
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Pending Requests
                {pendingCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-cyan-500 text-white rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('blocked')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'blocked'
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Blocked Users
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading...</div>
            ) : (
              <>
                {/* Connections Tab */}
                {activeTab === 'connections' && (
                  <div>
                    {connections.length === 0 ? (
                      <div className="text-center py-8 text-gray-600">
                        No connections yet. Use the invite link below to connect with friends.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {connections.map((connection) => (
                          <div
                            key={connection._id}
                            className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {connection.user.displayName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                @{connection.user.username}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveConnection(connection.user._id)}
                              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Tab */}
                {activeTab === 'pending' && (
                  <div className="space-y-8">
                    {/* Incoming Requests */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                        Received ({pending.length})
                      </h3>
                      {pending.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          No incoming requests.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pending.map((request) => (
                            <div
                              key={request._id}
                              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                            >
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {request.requester.displayName || request.requester.username}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  @{request.requester.username}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptRequest(request._id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleDeclineRequest(request._id)}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sent Requests */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                        Sent ({sent.length})
                      </h3>
                      {sent.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          No sent requests.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sent.map((request) => (
                            <div
                              key={request._id}
                              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                            >
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {request.recipient?.displayName || request.recipient?.username || 'Unknown'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {request.recipient?.username ? `@${request.recipient.username}` : ''}
                                </p>
                              </div>
                              <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-sm font-medium rounded-lg">
                                Awaiting response
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Blocked Tab */}
                {activeTab === 'blocked' && (
                  <div>
                    {blocked.length === 0 ? (
                      <div className="text-center py-8 text-gray-600">
                        No blocked users.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {blocked.map((block) => (
                          <div
                            key={block._id}
                            className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {block.blockedUser.displayName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                @{block.blockedUser.username}
                              </p>
                            </div>
                            <button
                              onClick={() => handleUnblock(block.blockedUser._id)}
                              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
                            >
                              Unblock
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Invite Link Section */}
        {activeTab === 'connections' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Invite Friends
            </h2>
            <p className="text-gray-600 mb-4">
              Generate a shareable invite link to connect with friends and family.
            </p>

            {!inviteCode ? (
              <button
                onClick={handleGenerateInvite}
                className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
              >
                Generate Invite Link
              </button>
            ) : (
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/connections/invite/${inviteCode}`}
                    className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800"
                  />
                  <button
                    onClick={handleCopyInvite}
                    className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
                  >
                    {copiedCode ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Share this link with anyone you want to connect with.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
