import pytest
from scamscanner.services.pipe import Pipe

@pytest.mark.asyncio
async def test_pipe_run():
    """
    Tests that the Pipe class correctly applies a sequence of asynchronous
    processing functions to its input.
    """
    # Define some simple async functions to use as stages in the pipe
    async def stage_one(data, *args, **kwargs):
        return data + 1

    async def stage_two(data, *args, **kwargs):
        return data * 2

    # Create a new Pipe and add the stages
    pipe = Pipe()
    pipe.add_stage(stage_one)
    pipe.add_stage(stage_two)

    # Run the pipe with an initial value of 10
    result = await pipe.run(10)

    # The result should be (10 + 1) * 2 = 22
    assert result == 22