import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborationComponent } from './collaboration.component';

describe('CollaborationComponent', () => {
  let component: CollaborationComponent;
  let fixture: ComponentFixture<CollaborationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CollaborationComponent]
    });
    fixture = TestBed.createComponent(CollaborationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
