import { ISignalsManager } from "../types/interfaces";
import { SignalCallback } from "../types/types";

class SignalsManager implements ISignalsManager {
  private static instance: SignalsManager;
  private signals: Map<string, Set<SignalCallback>>;

  private constructor() {
    this.signals = new Map();
  }

  public static getInstance(): SignalsManager {
    if (!SignalsManager.instance) {
      SignalsManager.instance = new SignalsManager();
    }
    return SignalsManager.instance;
  }

  public on(signalName: string, callback: SignalCallback): void {
    console.log(
      `%cSignalsManager: Registering callback for signal "${signalName}"`,
      this.getConsoleLogStyle()
    );

    if (!this.signals.has(signalName)) {
      this.signals.set(signalName, new Set());
    }

    this.signals.get(signalName)!.add(callback);
  }

  public emit(signalName: string, ...args: any[]): void {
    console.log(
      `%cSignalsManager: Emitting signal "${signalName}"`,
      this.getConsoleLogStyle(),
      args
    );

    const callbacks = this.signals.get(signalName);
    if (!callbacks) {
      console.log(
        `%cSignalsManager: No callbacks registered for signal "${signalName}"`,
        this.getConsoleLogStyle()
      );
      return;
    }

    callbacks.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(
          `%cSignalsManager: Error executing callback for signal "${signalName}"`,
          this.getConsoleLogStyle(),
          error
        );
      }
    });
  }

  private getConsoleLogStyle(): string {
    return `color: white; background-color: #5c433d; font-weight: bold;`;
  }
}

export const signalsManager = SignalsManager.getInstance();
