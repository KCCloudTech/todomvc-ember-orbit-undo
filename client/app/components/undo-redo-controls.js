import Component from "@glimmer/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default class extends Component {

    @service undo;

    @action performUndo() {
        this.undo.undo();
    }

    @action performRedo() {
        this.undo.redo();
    }

}
