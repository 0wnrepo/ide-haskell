import {ResultItem} from './result-item'
import {CompositeDisposable, Emitter} from 'atom'
import {Provider, TMessageProviderFunction} from './provider'

export {TMessageProviderFunction, ResultItem}

export type TUpdateCallback = (severities: UPI.TSeverity[]) => void

export class ResultsDB {
  private currentId: number
  private messages: Map<string, ResultItem>
  private disposables: CompositeDisposable
  private emitter: Emitter
  constructor () {
    this.currentId = 0
    this.disposables = new CompositeDisposable()
    this.emitter = new Emitter()
    this.disposables.add(this.emitter)
    this.messages = new Map()
  }

  public destroy () {
    this.disposables.dispose()
  }

  public onDidUpdate (callback: TUpdateCallback) {
    return this.emitter.on('did-update', callback)
  }

  public didUpdate (providerId: number, msgs: ResultItem[]) {
    const uris = msgs.map((v) => v.uri).filter((v) => v) as string[]
    for (const [k, v] of Array.from(this.messages)) {
      if (v.providerId === providerId || v.uri && uris.includes(v.uri)) {
        this.messages.delete(k)
      }
    }
    for (const msg of msgs) {
      this.messages.set(msg.hash(), msg)
    }
    const severities: UPI.TSeverity[] = msgs.map((v) => v.severity)
    this.emitter.emit('did-update', severities)
  }

  public registerProvider () {
    const p = new Provider(this, ++this.currentId)
    this.disposables.add(p)
    return p
  }

  public results () {
    return this.messages.values()
  }

  public * filter (f: (item: ResultItem) => boolean) {
    for (const v of this.results()) {
      if (f(v)) { yield v }
    }
  }

  public isEmpty () {
    return this.messages.size === 0
  }
}
