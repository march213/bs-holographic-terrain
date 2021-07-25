varying float vElevation;

void main() {
  // float elevation = vElevation + 0.5;

  float alpha = mod(vElevation * 30.0, 1.0);

  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}
