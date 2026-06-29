import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import axios from 'axios'
import { authPreHandler } from './auth.js'

interface ProxyTestBody {
    proxyUrl: string
    proxyUser?: string
    proxyPassword?: string
    testUrl?: string
}

export async function proxyRoutes(app: FastifyInstance) {
    app.post(
        '/test',
        { preHandler: authPreHandler },
        async (request: FastifyRequest<{ Body: ProxyTestBody }>, reply: FastifyReply) => {
            try {
                const { proxyUrl, proxyUser, proxyPassword, testUrl = 'https://www.google.com/generate_204' } = request.body

                if (!proxyUrl) {
                    return reply.send({
                        success: false,
                        message: 'Proxy URL is required'
                    })
                }

                let proxyConfig: any = {
                    host: '',
                    port: 0,
                    protocol: 'http'
                }

                // 解析代理地址，支持 http://user:pass@host:port 格式
                try {
                    const proxyUrlObj = new URL(proxyUrl)
                    proxyConfig.protocol = proxyUrlObj.protocol.replace(':', '')
                    proxyConfig.host = proxyUrlObj.hostname
                    proxyConfig.port = proxyUrlObj.port ? parseInt(proxyUrlObj.port) : 
                        (proxyUrlObj.protocol === 'https:' ? 443 : 80)
                    
                    // 如果 URL 中包含用户名密码
                    if (proxyUrlObj.username) {
                        proxyConfig.auth = {
                            username: decodeURIComponent(proxyUrlObj.username),
                            password: decodeURIComponent(proxyUrlObj.password || '')
                        }
                    }
                } catch (e) {
                    // 如果不是完整 URL，尝试解析 host:port 格式
                    const parts = proxyUrl.split(':')
                    if (parts.length >= 2) {
                        proxyConfig.host = parts[0]
                        proxyConfig.port = parseInt(parts[1])
                    } else {
                        return reply.send({
                            success: false,
                            message: 'Invalid proxy URL format'
                        })
                    }
                }

                // 覆盖用户名密码
                if (proxyUser) {
                    proxyConfig.auth = {
                        username: proxyUser,
                        password: proxyPassword || ''
                    }
                }

                const startTime = Date.now()

                const response = await axios({
                    method: 'get',
                    url: testUrl,
                    proxy: proxyConfig,
                    timeout: 10000,
                    validateStatus: () => true // 接受所有 HTTP 状态码，只要连接成功
                })

                const elapsed = Date.now() - startTime

                return reply.send({
                    success: true,
                    message: 'Proxy connection successful',
                    status: response.status,
                    elapsed: `${elapsed}ms`
                })
            } catch (error: any) {
                console.error('Proxy test error:', error.message)
                return reply.send({
                    success: false,
                    message: error.message || 'Proxy connection failed'
                })
            }
        }
    )
}