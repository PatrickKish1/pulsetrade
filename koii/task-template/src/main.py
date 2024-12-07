class HelloWorld:
    """
    A simple class to demonstrate OOP with a hello world message
    """
    def __init__(self):
        self.message = "Hello, World from Pulse Trade!. We are glad you are here..."
    
    def get_message(self):
        """Returns the hello world message"""
        return self.message

def main():
    hello = HelloWorld()
    return hello.get_message()

if __name__ == "__main__":
    print(main())