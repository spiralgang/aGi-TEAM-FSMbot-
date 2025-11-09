import statemap
from ProofOfConcept_sm import ProofOfConcept_sm

# The context class that owns the FSM and implements the actions.
class CliContext:
    def __init__(self):
        self._fsm = ProofOfConcept_sm(self)
        self._state = self._fsm.getState()

    def get_state(self):
        return self._fsm.getState().getName()

    # FSM actions (placeholders).
    def start_processing(self):
        print("ACTION: Starting processing...")

    def process_succeeded(self):
        print("ACTION: Processing succeeded.")

    def process_failed(self):
        print("ACTION: Processing failed.")

    def reset_to_idle(self):
        print("ACTION: Resetting to Idle.")

    # FSM transition methods.
    def start(self):
        self._fsm.start()

    def succeed(self):
        self._fsm.succeed()

    def fail(self):
        self._fsm.fail()

    def reset(self):
        self._fsm.reset()

# Main CLI loop.
if __name__ == "__main__":
    context = CliContext()
    print(f"Initial state: {context.get_state()}")

    while True:
        command = input("Enter command (start, succeed, fail, reset, exit): ").strip().lower()

        if command == "start":
            context.start()
        elif command == "succeed":
            context.succeed()
        elif command == "fail":
            context.fail()
        elif command == "reset":
            context.reset()
        elif command == "exit":
            break
        else:
            print("Invalid command.")
            continue

        print(f"Current state: {context.get_state()}")