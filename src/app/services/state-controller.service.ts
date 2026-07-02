import { Injectable } from '@angular/core';

export interface TransitionDefinition {
  from: string;
  to: string;
  object?: unknown;
  handle?: (() => void) | null;
  delay?: number;
}

interface Transition {
  namespace: string;
  timeout_id: ReturnType<typeof setTimeout> | null;
  state: string;
  definitions: TransitionDefinition[];
  locked: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class StateControllerService {
  transitions: Record<string, Transition> = {};
  debug = false;

  log(msg: unknown): void {
    if (this.debug) {
      console.log(msg);
    }
  }

  registerTransitions(namespace: string, definitions: TransitionDefinition[], state: string): void {
    this.transitions[namespace] = {
      namespace: namespace,
      timeout_id: null,
      state: state,
      definitions: definitions,
      locked: false,
    };

    this.log(this.transitions);
  }

  lock(namespace: string, state: string): void {
    this.log('Locking ' + namespace);
    this.transition(namespace, state);
    this.transitions[namespace].locked = true;
  }

  unlock(namespace: string): void {
    this.log('Unlocking ' + namespace);
    this.transitions[namespace].locked = false;
  }

  getIsLocked(namespace: string): boolean {
    return this.transitions[namespace].locked;
  }

  getState(namespace: string): string {
    if (namespace in this.transitions) {
      return this.transitions[namespace].state;
    }

    return '';
  }

  setState(namespace: string, state: string): void {
    this.transitions[namespace].state = state;
  }

  transition(namespace: string, to: string): void {
    const transitions = this.transitions[namespace];

    if (!transitions) {
      this.log('Transitions for ' + namespace + ' not found');
      return;
    }

    if (transitions.locked) {
      this.log(namespace + ' is locked');
      return;
    }

    for (const definition of transitions.definitions) {
      if (definition.to === to) {
        if (definition.from !== transitions.state) {
          continue;
        }

        this.log(definition);

        if (transitions.timeout_id) {
          clearTimeout(transitions.timeout_id);
        }

        if (definition.delay !== undefined) {
          transitions.timeout_id = setTimeout(() => {
            transitions.state = to;

            if (definition.handle) {
              definition.handle();
            }
          }, definition.delay);
        } else {
          transitions.state = to;

          if (definition.handle) {
            definition.handle();
          }
        }

        break;
      }
    }
  }

  setDebug(debug: boolean): void {
    this.debug = debug;
  }
}
