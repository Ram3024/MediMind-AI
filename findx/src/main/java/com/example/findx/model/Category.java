package com.example.findx.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false, unique = true)
    private String name;

    @Column(name = "icon_class", length = 60)
    private String iconClass;

    @Column(length = 50)
    private String color;

    // ─── Getters & Setters ───────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIconClass() { return iconClass; }
    public void setIconClass(String iconClass) { this.iconClass = iconClass; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
