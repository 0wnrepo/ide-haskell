import {TextEditor, DisplayMarkerLayer} from 'atom'
import {eventRangeTypeVals} from '../utils'

export type IMarkerGroup = Array<{type: UPI.TEventRangeType, source?: string}>

export class EventTable {
  private table: {
    [K in UPI.TEventRangeType]: Map<string | undefined, DisplayMarkerLayer>
  }
  private layers: Set<DisplayMarkerLayer>
  constructor (private editor: TextEditor, groups: IMarkerGroup[]) {
    // tslint:disable-next-line:no-null-keyword
    this.table = Object.create(null)
    for (const i of eventRangeTypeVals) {
      this.table[i] = new Map()
    }
    this.layers = new Set()
    for (const i of groups) {
      const layer = this.editor.addMarkerLayer()
      this.layers.add(layer)
      for (const {type, source} of i) {
        this.table[type].set(source, layer)
      }
    }
  }

  public destroy () {
    for (const i of this.layers.values()) {
      i.destroy()
    }
    for (const i of this.values()) {
      i.clear()
    }
  }

  public get (type: UPI.TEventRangeType, source?: string) {
    let res = this.table[type].get(source)
    if (!res) {
      res = this.table[type].get(undefined)
    }
    if (!res) {
      throw new Error(`Failed to classify ${type}:${source}`)
    }
    return res
  }

  public clear () {
    for (const i of this.layers.values()) {
      i.clear()
    }
  }

  public getMarkerCount () {
    let count = 0
    for (const i of this.layers.values()) {
      count += i.getMarkerCount()
    }
    return count
  }

  public * values () {
    for (const i of eventRangeTypeVals){
      yield this.table[i]
    }
  }

  public * entries () {
    for (const i of eventRangeTypeVals){
      yield [i, this.table[i]]
    }
  }
}
