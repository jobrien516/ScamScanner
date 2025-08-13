from typing import Callable, Awaitable, List, Any, Union


class Pipe:
    """
    Pipe that applies a sequence of asynchronous processing functions to its input.
    Each stage receives (input, *args, **kwargs) and returns output.
    """

    def __init__(self):
        self.stages: List[Callable[[Any], Awaitable[Any]]] = []

    def add_stage(self, stage: Callable[[Any], Awaitable[Any]]) -> None:
        """
        Adds an async processing function to the pipe.
        Stage functions must accept (input, *args, **kwargs) and return processed output.
        """
        self.stages.append(stage)

    async def run(self, data: Any, *args, **kwargs) -> Any:
        """
        Runs the pipe by passing data through each stage in sequence.
        """
        result = data
        for stage in self.stages:
            result = await stage(result, *args, **kwargs)
        return result
