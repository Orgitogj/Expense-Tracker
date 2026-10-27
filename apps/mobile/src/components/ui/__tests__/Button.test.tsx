import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import Button from "../Button";

describe("Button", () => {
  it("shows its label and reports presses", async () => {
    const onPress = jest.fn();
    await render(
      <Button onPress={onPress}>
        <Text>Save</Text>
      </Button>,
    );

    await fireEvent.press(screen.getByText("Save"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("hides its label while loading and restores it afterwards", async () => {
    const onPress = jest.fn();
    const { rerender } = await render(
      <Button onPress={onPress} loading>
        <Text>Save</Text>
      </Button>,
    );

    expect(screen.queryByText("Save")).toBeNull();

    await rerender(
      <Button onPress={onPress}>
        <Text>Save</Text>
      </Button>,
    );
    await fireEvent.press(screen.getByText("Save"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
