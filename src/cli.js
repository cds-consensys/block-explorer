#! /usr/bin/env node
const { blockQuery } = require('./explorer')
const report = require('./report')

const neodoc = require('neodoc')
const version = '0.0.1'

const doc = `
Blockchain explorer tool to study that ETH velocity.

Usage:
  bkx STARTBLOCK ENDBLOCK --net=NETWORK [--logtrans --logblocks --logcontracts]
  bkx FROMCURRENTBLOCK --net=NETWORK [--logtrans --logblocks --logcontracts]

Options:
  -h --help         Show help
  -v --version      Show version
  --net=NETWORK     The network to use. (mainnet, rinkeby, local) [default: local]
  --logtrans        Log summary of each processed transaction
  --logblocks       Log blocks
  --logcontracts    Log created contracts
`

// JS implementation of POSIX arg parser http://docopt.org
const args = neodoc.run(doc, { version })

// force console output
args.hasConsole = true
console.log(args)

try {
  const startTime = Date.now()
  blockQuery(args).then(db => {
    report.display(db)
    const runTime = Date.now() - startTime
    console.log('Done in ', runTime / 1000, ' secs')
    process.exit()
  })
} catch (error) {
  console.log(error)
  process.exit()
}
