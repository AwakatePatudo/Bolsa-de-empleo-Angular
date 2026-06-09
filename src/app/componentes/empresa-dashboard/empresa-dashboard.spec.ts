import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresaDashboard } from './empresa-dashboard';

describe('EmpresaDashboard', () => {
  let component: EmpresaDashboard;
  let fixture: ComponentFixture<EmpresaDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmpresaDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(EmpresaDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
