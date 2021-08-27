import React from "react";
import {render, screen, cleanup} from "@testing-library/react";
import styles from "../../../components/load/load-list.module.scss";
import Divider from "./divider";

afterEach(() => {
  cleanup();
});

test("should render a Divider component ", () => {
  render(<Divider>This is a divider check</Divider>);
  const dividerElement = screen.getByTestId("divider-component");
  expect(dividerElement).toBeInTheDocument();
});

test("should render a vertical Divider component with styles", () => {
  render(<Divider type="vertical" style={{height: "55vh !important"}}>This is a vertical component divider with style</Divider>);
  const dividerElement = screen.getByTestId("divider-component");
  expect(dividerElement).toHaveStyle("height: 55vh !important");
  expect(dividerElement).toBeInTheDocument();
});

test("should render a vertical Divider component with a class", () => {
  render(<Divider type="vertical" className={styles.verticalDiv}>This is a vertical divider check with a class</Divider>);
  const dividerElement = screen.getByTestId("divider-component");
  expect(dividerElement).toContainHTML("verticalDiv");
  expect(dividerElement).toBeInTheDocument();
});

test("should render a horizontal Divider component dashed", () => {
  render(<Divider dashed={true}>This is a horizontal component divider dashed</Divider>);
  const dividerElement = screen.getByTestId("divider-component");
  expect(dividerElement).toBeInTheDocument();
});