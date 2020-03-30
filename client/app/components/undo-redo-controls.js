import Component from "@glimmer/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default class extends Component {

  @service undo;

  constructor() {
    super(...arguments);

    this.undo.canUndo;
  }

  get cannotUndo() {
    return !this.undo.canUndo;
  }

  get cannotRedo() {
    return !this.undo.canRedo;
  }

  @action performUndo() {
    this.undo.undo();
  }

  @action performRedo() {
    this.undo.redo();
  }

}
