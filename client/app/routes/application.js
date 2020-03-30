import { inject as service } from "@ember/service";
import Route from "@ember/routing/route";

export default class extends Route {
  @service store;
  @service dataCoordinator;
  @service undo;

  async beforeModel() {
    console.log("Sources:", this.dataCoordinator.sourceNames);

    // If a backup source is present, populate the store from backup prior to
    // activating the coordinator
    const backup = this.dataCoordinator.getSource("backup");
    if (backup) {
      const transform = await backup.pull(q => q.findRecords());
      await this.store.sync(transform);

      this.undo.enable(); // Wait until now to enabled so as not to undo from previous session.
    }

    await this.dataCoordinator.activate();
    await this.store.query(q => q.findRecords("todo"));
  }
}
