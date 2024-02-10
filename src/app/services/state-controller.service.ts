import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class StateControllerService {

  transitions: any = {};
  debug: boolean = false;

  constructor() { }

  log(msg: any) {
      if(this.debug) {
          console.log(msg);
      }
  }

  registerTransitions(namespace: string, definitions: any, state: string) {
      this.transitions[namespace] = {
        namespace: namespace,
        timeout_id: null,
        state: state,
        definitions: definitions,
        locked: false
      };

      this.log(this.transitions);
  }

  lock(namespace: string, state: string) {
    this.log('Locking ' + namespace);
    this.transition(namespace, state);
    this.transitions[namespace].locked = true;
  }

  unlock(namespace: string) {
    this.log('Unlocking ' + namespace);
    this.transitions[namespace].locked = false;
  }

  getIsLocked(namespace: string) {
    return this.transitions[namespace].locked;
  }
  
  getState(namespace: string) {
    if(namespace in this.transitions) {
      return this.transitions[namespace].state;
    }

    return '';
  }

  setState(namespace: string, state: string) {
      this.transitions[namespace].state = state;
  }

  transition(namespace: string, to: string) {
      var transitions = this.transitions[namespace];

      if(!transitions) {
        this.log('Transitions for ' + namespace + ' not found');
        return;
      }

      if(transitions.locked != undefined && transitions.locked) {
        this.log(namespace + ' is locked');
        return;
      }

      for(var i = 0; i < transitions.definitions.length; i++) {
          var definition = transitions.definitions[i];

          if(definition.to == to) {
              if(definition.from != transitions.state) {
                  continue;
              }

              this.log(definition);
              
              if(transitions.timeout_id) {
                clearTimeout(transitions.timeout_id);
              }
              
              if(definition.delay != undefined) {
                  transitions.timeout_id = setTimeout(function() {
                      transitions.state = to;

                      if(definition.handle) {
                        definition.handle(definition);
                      }
                  }, definition.delay);
              } else {
                  transitions.state = to;

                  if(definition.handle) {
                    definition.handle(definition);
                  }
              }

              break;
          }
      }
  }

  setDebug(debug: boolean) {
      this.debug = debug;
  }
}
