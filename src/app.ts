import { createSshClient } from './ssh'
import https from 'https'
import * as tls from 'tls'
import * as net from 'net'
import path from 'path'
import { readFileSync } from 'fs'
import express from 'express'
import httpProxy from 'http-proxy'
import { Command, Option } from 'commander'

const app = express()
const apiProxy = httpProxy.createProxyServer()

const program = new Command()
    .requiredOption('--server-access-key <key>')
    .addOption(new Option('--server-access-key <key>', 'The access key for this client').env('APP_SERVER_ACCESS_KEY'))
    .addOption(new Option('--server-addr [host:port]', 'The address of the tunnel service').env('APP_SERVER_ADDR').default('vps.codeine.dev'))
    .addOption(new Option('--target [host:port]', 'The HTTP target to expose').env('APP_TARGET').default('localhost:8001'))
    .action(args => {
        console.log('Args:', args)

        const username: string = args['serverAccessKey']
        const [ host, port ] = (args['serverAddr'] as string ?? '').split(':')
        const [ backendHost, backendPort ] = (args['target'] as string ?? '').split(':')

        tls.createServer({
            ca: readFileSync(path.join(process.cwd(), './data/k8s-agent-ca/k8s-agent-ca.crt')),
            cert: readFileSync(path.join(process.cwd(), './data/k8s-agent-ca/k8s-agent.crt')),
            key: readFileSync(path.join(process.cwd(), './data/k8s-agent-ca/k8s-agent.key')),
        }, (incoming) => {
            const backend = net.createConnection(parseInt(backendPort, 10), backendHost, () => {
                backend.pipe(incoming).pipe(backend)
            }).on('error', () => {})
        }).listen(6443)

        createSshClient({
            host,
            port: parseInt(port ?? '2222', 10),
            username,
            password: '',
        }, (channel) => {
            const socket = net.createConnection({
                host: 'localhost',
                port: 6443
            }, () => {
                
            }).on('connect', () => {
                socket.pipe(channel).pipe(socket)
            }).on('error', () => {})
        })
    })
    .parse()
