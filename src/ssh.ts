import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join, resolve } from 'path'
import * as ssh2 from 'ssh2'

export interface SshConfig {
    host: string,
    port: number,
    username: string,
    password: string,
}

export const createSshClient = (opts: SshConfig, handler: (channel: ssh2.ClientChannel) => void) => {
    const connection = new ssh2.Client()
    return connection
        .on('ready', () => {
            connection.forwardIn('127.0.0.1', 443, (err, bindPort) => {
                if (err) throw err
                console.log('Listening for connections on server port', bindPort)
            })
        })
        .on('tcp connection', (details, accept, reject) => {
            const channel = accept()
            handler(channel)
        })
        .connect({
            ...opts,
            privateKey: readFileSync(join(homedir(), '.ssh/id_rsa_test'))
        })
}