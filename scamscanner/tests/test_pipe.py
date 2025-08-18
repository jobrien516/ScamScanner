import pytest
from scamscanner.services.pipe import Pipe


@pytest.mark.asyncio
async def test_pipe_run():
    """
    Tests that the Pipe class correctly applies a sequence of asynchronous
    processing functions to its input.
    """
    async def stage_one(data, *args, **kwargs):
        return data + 1

    async def stage_two(data, *args, **kwargs):
        return data * 2

    pipe = Pipe()
    pipe.add_stage(stage_one)
    pipe.add_stage(stage_two)

    result = await pipe.run(10)

    assert result == 22
