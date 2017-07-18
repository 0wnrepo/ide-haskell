import {
  Range, TextEditor, CompositeDisposable
} from 'atom'

import {PluginManager} from '../plugin-manager'
import {CREditorControl} from './editor-control'

export class CheckResultsProvider {
  private disposables: CompositeDisposable
  private editorMap: WeakMap<TextEditor, CREditorControl>
  constructor (editor: TextEditor, pluginManager: PluginManager) {
    const tooltipRegistry = pluginManager.tooltipRegistry

    this.editorMap = new WeakMap()
    this.disposables = new CompositeDisposable()
    this.disposables.add(tooltipRegistry.register('builtin:check-results', {
      priority: 1000,
      handler: this.tooltipProvider.bind(this),
      eventTypes: ['mouse', 'keyboard'],
    }))
    pluginManager.addEditorController(CREditorControl, this.editorMap)
  }

  public destroy () {
    this.disposables.dispose()
  }

  private tooltipProvider (editor: TextEditor, crange: Range, type: UPI.TEventRangeType): UPI.ITooltipData | undefined {
    const controller = this.editorMap.get(editor)
    if (!controller) { return }
    if (type === 'keyboard' && atom.config.get('ide-haskell.onCursorMove') !== 'Show Tooltip') { return }
    const msg = controller.getMessageAt(crange.start, type)
    if (msg.length > 0) {
      // TODO: WTF? MessageObject forbidden?
      return { range: crange, text: msg.map((m) => m.toHtml()) }
    }
  }
}
